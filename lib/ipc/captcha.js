const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer;

function yes(callback) {

  return new Promise(

    (resolve, reject) => {

      console.log(callback);
      ipcRenderer.send('captcha-incoming', {captcha: callback, task_id: remote.getCurrentWindow().task_id});
      console.log("heyyy");
      grecaptcha.reset();

    }

  )

}
