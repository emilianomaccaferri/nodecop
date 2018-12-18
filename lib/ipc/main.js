const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

$("#new").on('click', (e) => {

  ipcRenderer.send('new-task')

})

$("#g-login").on('click', (e) => {

  ipcRenderer.send('google-login')

})
