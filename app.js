const {app, ipcMain, BrowserWindow, session, dialog, Menu} = require('electron');
const DATA_DIR = app.getPath('userData');
const utils = require("./lib/Utils");
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

var main, google, taskCreator;
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

      console.log(utils.config);

      main = new BrowserWindow({width: 800, height: 900, minHeight: 900, minWidth: 800, show: false, fullscreenable: true, center: true})
      const m = Menu.buildFromTemplate(mainTemplate);
      Menu.setApplicationMenu(m)

      main.loadURL(`file://${__dirname}/views/index.html`);
      main.on('ready-to-show', () => {

        main.show();

      })

    })

}

//////////////////

// TASK CREATOR WINDOW

var task = () => {

  var d = new Date();
  utils.updateConfig({

    profiles: {

      'tonno': []

    }

  })

}


//////////////////////

// GOOGLE LOGIN WINDOW


var googleLogin = () => {

  google = new BrowserWindow({
    backgroundColor: '#ffffff',
    center: true,
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
  google.loadURL('https://accounts.google.com/signin/v2/identifier?hl=en&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26hl%3Den%26app%3Ddesktop%26next%3D%252F%26action_handle_signin%3Dtrue&passive=true&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

  google.on('closed', () => {

    google = null;

  })


}


//////////////////////


// IPC Events

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
