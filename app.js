'use strict'

const {app, ipcMain, BrowserWindow, session, dialog, Menu} = require('electron');
const DATA_DIR = app.getPath('userData');
const utils = require("./lib/Utils");
const Task = require("./lib/Task");
utils.DATA_DIR = DATA_DIR
const fs = require("fs");

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

var main, google, taskCreator, tasks = {};
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

        console.log(typeof e[1]);

        var t = new Task(e[1])
        tasks[e[0]] = t;

      })

      main = new BrowserWindow({width: 800, height: 900, minHeight: 900, minWidth: 800, show: false, fullscreenable: true, center: true})
      const m = Menu.buildFromTemplate(mainTemplate);
      Menu.setApplicationMenu(m)

      main.loadURL(`file://${__dirname}/views/index.html`);
      main.on('ready-to-show', () => {

        main.webContents.send('config', utils.config)
        // main.openDevTools();
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


// IPC Events

ipcMain.on('create-task', (event, item) => {

  logger.info('creating new task (', item.task_id, ' - ', item.task_name, ')')
  utils.config[item.task_id] = item;
  utils.updateConfig(utils.config)
    .then(success => {

      t = new Task(item);
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

  if (mainWindow === null)
    init()

})
