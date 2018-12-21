'use strict'

const {app, ipcMain, BrowserWindow, session, dialog, Menu} = require('electron');
const DATA_DIR = app.getPath('userData');
const utils = require("./lib/Utils");
const Task = require("./lib/Task");
utils.DATA_DIR = DATA_DIR
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const Promise = require("promise")

// btw thanks to https://github.com/dzt/captcha-harvester for the captcha stuff

if (!fs.existsSync(DATA_DIR + '/logs')) {
    fs.mkdirSync(DATA_DIR + '/logs')
}
if (!fs.existsSync(DATA_DIR + '/data')) {
    fs.mkdirSync(DATA_DIR + '/data')
}

const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: DATA_DIR + '/logs/latest.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    },
logger = SimpleNodeLogger.createSimpleLogger(opts);
utils.logger = logger;

logger.info('starting up NodeCop')

///////// MAIN WINDOW

var main, google, taskCreator, tasks = {}, captchas = [], expressApp;

expressApp = express() // i need a proxy for the captcha
expressApp.set('port', 9090);
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
var server;

const mainTemplate = [

  {

    label: 'File',
    submenu: [

      {

        label: 'About NodeCop',
        click: () => {

          loadAbout();

        }

      }

    ]

  }

]

var init = () => {

  utils.loadConfig()
    .then(success => {

      logger.info('config decrypted')
      var entries = Object.entries(utils.config);

      // we load tasks so we already have them in memory
      // just to speed up things

      entries.map(e => {

        var t = new Task(e[1])
        tasks[e[0]] = t;

      })

      main = new BrowserWindow({width: 800, height: 900, minHeight: 900, minWidth: 800, show: false, fullscreenable: true, center: true})
      const m = Menu.buildFromTemplate(mainTemplate);
      Menu.setApplicationMenu(m)

      main.loadURL(`file://${__dirname}/views/index.html`);
      main.on('ready-to-show', () => {

        main.webContents.send('config', utils.config)
        main.openDevTools();
        main.show();

      })

    })

}

//////////////////

// TASK CREATOR WINDOW

var task = () => {

  taskCreator = new BrowserWindow({

    backgroundColor: '#fff',
    center: true,
    alwaysOnTop: true,
    fullscreen: false,
    height: 900,
    maximizable: false,
    minimizable: true,
    resizable: false,
    show: false,
    skipTaskbar: true,
    title: 'Create new task',
    useContentSize: true,
    width: 700

  });

  taskCreator.loadURL(`file://${__dirname}/views/task.html`);

  taskCreator.on('ready-to-show', () => {

    taskCreator.show();
    // taskCreator.openDevTools();
    taskCreator.setAlwaysOnTop(true)

  })

  taskCreator.on('closed', () => {

    taskCreator = null;

  })

}


//////////////////////

// GOOGLE LOGIN WINDOW


var googleLogin = () => {

  google = new BrowserWindow({
    backgroundColor: '#212121',
    center: true,
    alwaysOnTop: true,
    fullscreen: false,
    height: 550,
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    title: 'Google login',
    useContentSize: true,
    width: 600
  });

  google.show();
  google.setAlwaysOnTop(true)
  google.loadURL('https://accounts.google.com/signin/v2/identifier?hl=en&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26hl%3Den%26app%3Ddesktop%26next%3D%252F%26action_handle_signin%3Dtrue&passive=true&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

  google.on('closed', () => {

    google = null;

  })


}


//////////////////////

var loadCaptcha = async(id, name) => {

  var last = captchas.push(new BrowserWindow({

      backgroundColor: '#ffffff',
      center: true,
      fullscreen: false,
      height: 550,
      maximizable: false,
      minimizable: false,
      resizable: false,
      show: false,
      skipTaskbar: true,
      title: name,
      useContentSize: true,
      width: 600

  }))

  console.log(captchas)
  //var captchas[last - 1] = captchas[last - 1];

  expressApp.get('/', (req, res) => {

      res.sendFile('./views/captcha.html', {root: __dirname});
      captchas[last - 1].webContents.session.setProxy({proxyRules: ""}, () => {})

  })

  main.webContents.session.setProxy({
    proxyRules: `http://127.0.0.1:9090`
  },
    function (r) {
      captchas[last - 1].loadURL('http://www.supremenewyork.com');
    });

    captchas[last - 1].setMenu(null);

    captchas[last - 1].once('closed', function() {
      delete captchas.pop(captchas[last - 1]);
      captchas.shift();
      main.webContents.send('closed', id)
  })
  captchas[last - 1].show();
  captchas[last - 1].webContents.task_id = id;
  return captchas[last - 1]

}


var runTask = (id) => {

  var task = tasks[id];

  task.on('searching', () => {

    logger.info(`searching item ${id}`)

  })

  task.on('task-captcha', () => {

    console.log(task);
    loadCaptcha(id, task.item.item_name)

  })

  task.on('sold_out', () => {

    logger.info(`item sold out (maybe) ${id}`)
    if(task.stopped)
      return;

    setTimeout(() => {

      task.run();

    }, 1000)

  }).run();

}


// IPC Events

ipcMain.on('stop-task', (event, id) => {

  var task = tasks[id];
  task.stop();

})

ipcMain.on('run-task', async(event, id) => {

  runTask(id)

})

ipcMain.on('remove-task', async(event, id) => {

  var item = utils.config[id]
  logger.info('removing task (', item.task_id, ' - ', item.task_name, ')')
  delete utils.config[item.task_id];
  delete tasks[id]
  await utils.updateConfig(utils.config)
  logger.info('config updated')

})

ipcMain.on('create-task', (event, item) => {

  logger.info('creating new task (', item.task_id, ' - ', item.task_name, ')')
  utils.config[item.task_id] = item;
  utils.updateConfig(utils.config)
    .then(success => {

      var t = new Task(item);
      tasks[item.item_id] = t;
      main.webContents.send('task-update', item)

    })

    .catch(err => {

      logger.error('uh oh', err)

    })

})

ipcMain.on('google-login', () => {

  googleLogin();

})

ipcMain.on('new-task', () => {

  task();

})


// App related stuff
app.on('ready', init)
app.on('window-all-closed', () => {

  fs.renameSync(DATA_DIR + '/logs/latest.log', DATA_DIR + '/logs/nodecop-' + new Date().getTime() + '.log')

  if (process.platform !== 'darwin')
    app.quit()

})

app.on('activate', () => {

  if (main === null)
    init()

})
