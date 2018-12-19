const fs = require("fs");
const Promise = require("promise")
const crypto = require("crypto");
const random = require("randomstring");
const { Readable } = require('stream');

const key = 'ciao' // dummy key
const algorithm = 'aes-256-cbc';
const cipher = crypto.createCipher(algorithm, key);

module.exports.DATA_DIR = null;
module.exports.config = null;
module.exports.logger = null;

module.exports.updateConfig = (cfg) => {

  return new Promise(

    (resolve, reject) => {

      // blazing fast stuff
      var d = new Date();
      var streamFromBuffer = new Readable();
      streamFromBuffer.push(Buffer.from(JSON.stringify(cfg), "utf-8"))
      streamFromBuffer.push(null);

      var encrypt = crypto.createCipher(algorithm, key);
      var write = fs.createWriteStream(exports.DATA_DIR + '/data/config.cop', {flags: 'w'});

      streamFromBuffer.pipe(encrypt).pipe(write);

      write.on('finish', () => {

        var time = (new Date().getTime() / 1000) - (d.getTime() / 1000)

        exports.logger.info('config updated in ', time.toFixed(5), 's');

        return resolve(true)

      })

    }

  )

}

module.exports.loadConfig = () => {

  return new Promise(

    (resolve, reject) => {

      try{

        fs.statSync(exports.DATA_DIR + '/data/config.cop')
        var tmp = "";
        var read = fs.createReadStream(exports.DATA_DIR + '/data/config.cop');

        // runtime decrypting

        read.on('data', chunk => {

          tmp += decrypt(chunk).toString('utf-8');

        })

        read.on('end', () => {

          console.log("i decrypted the config, man")
          exports.config = JSON.parse(tmp);
          return resolve(true);

        })


      }catch(err){

        if(err.code != 'ENOENT')
          return reject(err)

        var b = Buffer.from('{}', 'utf-8');
        var enc = encrypt(b);
        fs.writeFileSync(exports.DATA_DIR + '/data/config.cop', enc);
        exports.config = {}

        return resolve(true);

      }

    }

  )

}

// Part of https://github.com/chris-rock/node-crypto-examples

function encrypt(buffer){

  var cipher = crypto.createCipher(algorithm, key)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;

}

function decrypt(buffer){
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}
