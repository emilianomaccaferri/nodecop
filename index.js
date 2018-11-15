const {app, ipcMain, BrowserWindow, session, dialog, Menu} = require('electron')
const fs = require("fs");
const utils = require("./lib/Utils");
const cipher = require("node-cipher")
const random = require("randomstring");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const Promise = require("promise")

expressApp = express()
expressApp.set('port', 9090);
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
var server;

require('dns').resolve('www.google.com', function(err) {
  if (err) {
    dialog.showMessageBox({message: "Something is not working with your network.\nNodeCop has to be able to access the internet/resolve domains to function properly.\nFix your connectivity issues and try again.",
      buttons: ["Ok then"]
    });
    app.quit();
  }
});

  var mainWindow, aboutWindow, newTaskWindow, gmail, capWin, paypal, expressApp, currentItem, captchas = [];

  var init = () => {

    utils.loadConfig()
      .then(success => {

        server = expressApp.listen(expressApp.get('port'));
        mainWindow = new BrowserWindow({width: 800, height: 900, minHeight: 900, minWidth: 800, show: false, fullscreenable: true, center: true})

        const template = [

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

        const m = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(m)

        mainWindow.loadURL(`file://${__dirname}/lib/views/html/index.html`);

        mainWindow.on('ready-to-show', () => {

          mainWindow.show();
          //mainWindow.openDevTools();
          mainWindow.webContents.send('config', utils.config);

        })

        mainWindow.on('closed', () => {

          mainWindow = null;

          if (process.platform !== 'darwin')
            app.quit()

        })

      })

      .catch(err => {

        throw err;

      })

}

app.on('ready', init)

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin')
    app.quit()

  server.close();

})

app.on('activate', () => {

  if (mainWindow === null)
    init()

})

var loadAbout = () => {

  if(aboutWindow)
    return;

  aboutWindow = new BrowserWindow({

    width: 400,
    height: 500,
    minWidth: 400,
    minHeight: 500,
    resizable: true,
    maxWidth: 400,
    maxHeight: 500,
    fullscreenable: false,
    frame: true,
    show: true

  })


  aboutWindow.loadFile('./lib/views/html/about.html')
  aboutWindow.setMenu(null);
  aboutWindow.on('closed', () => {

    aboutWindow = null;

  })

}
ipcMain.on('openPaypal', (event, key) => {

  openPaypal();

})
ipcMain.on('delete', (event, key) => {

  console.log("removing %s", key);
  utils.deleteProfile(key)
    .then(success => {

      console.log("successfully deleted")
      return utils.updateConfig();

    })

    .then(success => {

      console.log("config updated")

    })

})

ipcMain.on('new', (event, item) => {

  console.log("new item:" + JSON.stringify(item))
  item["id"] = random.generate(16);
  utils.config.profiles.push(item);
  mainWindow.webContents.send('newItem', item)
  utils.updateConfig()
    .then(success => {

      console.log("config has been updated");

    })

})

ipcMain.on('run', (event, key) => {

  console.log(key)
  utils.filter(key)
    .then(success => {

      console.log(key)
      var item = success.item;
      var r = success.request;
      coppingCaptcha(item.item_name, r, key)
        .then(captchaWindow => {

          console.log("opened captcha")
          captchaWindow["item"] = item;

        })

    })

})

ipcMain.on('cap', (event, stuff) => {

  console.log("captcha!")
  utils.finish(stuff.captcha, stuff.item, event.sender["webContents"].request)
    .then(success => {

      mainWindow.webContents.send('checkout_url', success)

    })

})

var coppingCaptcha = (name, r, id) => {

  return new Promise(

    (resolve, reject) => {

      console.log(id)

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

        res.sendFile('./lib/views/html/captcha.html', {root: __dirname});
        captchas[last - 1].webContents.session.setProxy({proxyRules: ""}, () => {})

      })

      mainWindow.webContents.session.setProxy({
        proxyRules: `http://127.0.0.1:9090`
      },
      function (r) {
          captchas[last - 1].loadURL('http://www.supremenewyork.com');
      });

      captchas[last - 1].setMenu(null);

      captchas[last - 1].once('closed', function() {
          delete captchas.pop(captchas[last - 1]);
          captchas.shift();
          mainWindow.webContents.send('closed', id)
          //server.close();
      })

      //captchas[last - 1].openDevTools();
      captchas[last - 1].show();
      captchas[last - 1].webContents.request = r;
      return resolve(captchas[last - 1])

    }

  )

}

var openPaypal = () => {

  return new Promise(

    (resolve, reject) => {

      if(paypal)
        return;

          paypal = new BrowserWindow({
              backgroundColor: '#ffffff',
              center: true,
              fullscreen: false,
              height: 550,
              maximizable: false,
              minimizable: false,
              resizable: false,
              show: false,
              skipTaskbar: true,
              title: 'Do some Captcha',
              useContentSize: true,
              width: 600
          })

          paypal.setMenu(null);
          // capWin.openDevTools();
          paypal.loadURL('https://www.paypal.com/it/signin');
          paypal.once('closed', function() {
              paypal = null
              //server.close();
          })

          paypal.on('ready-to-show', () => {

            paypal.show();

          })

        }

  )

}

var external = () => {

// https://github.com/dzt/captcha-harvester BIG UPPPPPPPP
  return new Promise(

    (resolve, reject) => {

      if (capWin == null) {

          expressApp.get('/', function(req, res) {
              res.sendFile('./lib/views/html/captchaNot.html', {root: __dirname});
              capWin.webContents.session.setProxy({proxyRules:""}, function () {});
          })

          mainWindow.webContents.session.setProxy({
            proxyRules: `http://127.0.0.1:9090`
          },
          function (r) {
              capWin.loadURL('http://www.supremenewyork.com');

          });

          capWin = new BrowserWindow({
              backgroundColor: '#ffffff',
              center: true,
              fullscreen: false,
              height: 550,
              maximizable: false,
              minimizable: false,
              resizable: false,
              show: false,
              skipTaskbar: true,
              title: 'Do some Captcha',
              useContentSize: true,
              width: 600
          })

          capWin.setMenu(null);
          // capWin.openDevTools();

          capWin.once('closed', function() {
              capWin = null
              //server.close();
          })

          return resolve(capWin.show());
        } else {
          return;
        }

    }

  )

}

ipcMain.on('openCaptcha', (event, key) => {

  external();

})

ipcMain.on('openGoogle', () => {

  gmail = new BrowserWindow({
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

  gmail.loadURL('https://accounts.google.com/signin/v2/identifier?hl=en&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26hl%3Den%26app%3Ddesktop%26next%3D%252F%26action_handle_signin%3Dtrue&passive=true&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

  gmail.on('ready-to-show', () => {

    gmail.show();

  })

  gmail.on('closed', () => {

    gmail = null;

  })

})

ipcMain.on('openTaskWindow', () => {

  console.log("Opening task window..")
  if(newTaskWindow)
    return;

  newTaskWindow = new BrowserWindow({

    title: 'New Task',
    width: 500,
    height: 950,
    minWidth: 500,
    minHeight: 350,
    resizable: false,
    maxWidth: 500,
    maxHeight: 950,
    fullscreenable: false,
    frame: true,
    show: false

  })

  newTaskWindow.loadFile('./lib/views/html/addTask.html')
  newTaskWindow.on('ready-to-show', () => {

    newTaskWindow.setMenu(null);
    newTaskWindow.show();
    //newTaskWindow.Tools();

  })
  newTaskWindow.on('closed', () => {

    newTaskWindow = null;

  })

})
