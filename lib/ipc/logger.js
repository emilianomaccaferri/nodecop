const Tail = require('nodejs-tail');
const remote = require('electron').remote
const app = remote.app
const filename = app.getPath('userData') + "/logs/latest.log";
const fs = require('fs');
var stream = fs.createReadStream(filename);

stream.on('data', (data) => {

  console.log(data);

})
