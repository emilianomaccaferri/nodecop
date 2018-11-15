const fs = require("fs");
const cipher = require("node-cipher")
const req = require('request');
const cheerio = require('cheerio')
const Promise = require('promise')

var start;

module.exports.config = {};

module.exports.getItem = (id) => {

  var config = exports.config;
  var it = config.profiles.filter(item => {

    console.log(item.id)
    if(item["id"] == id)
      return item

  })

  return it[0]

}

module.exports.filter = async(id) => {

  start = new Date();
  var desiredItem = exports.getItem(id)
  console.log(desiredItem)
  var url = await search(desiredItem.item_name, desiredItem.type, desiredItem.color);
  var copped = await cop(url, desiredItem);

  return {item: desiredItem, request: copped.request};

}

module.exports.deleteProfile = async(id) => {

  exports.config.profiles.pop(exports.getItem(id));
  return true;

}

module.exports.updateConfig = async() => {

  cipher.decrypt({input: __dirname + '/../config.nodecop', output: __dirname + '/../config.json', password: 'testpassword'}, (err, opts) => { // encryption is just for testing, it won't be done like this

    console.log(err)
    console.log(exports.config)
    fs.writeFile('config.json', JSON.stringify(exports.config), async(err) => {
      console.log(err)
      console.log("written!")
      await cipher.encrypt({input: __dirname + '/../config.json', output: __dirname + '/../config.nodecop', password: 'testpassword'}); // encryption is just for testing, it won't be done like this
      //fs.unlinkSync('config.json')

      return true;

    });

  });

}

module.exports.loadConfig = async() => {

  fs.stat('config.nodecop', async(err, stats) => {

    if(err){

      fs.writeFile('config.base.json', '{"profiles": []}', (err) => {

        cipher.encrypt({input: __dirname + '/../config.base.json', output: __dirname + '/../config.nodecop', password: 'testpassword'}, async(err, done) => { // encryption is just for testing, it won't be done like this

          exports.config = {profiles: []}
          return true;

        })

      });

    }else{

      cipher.decrypt({input: __dirname + '/../config.nodecop', output: __dirname + '/../config.json', password: 'testpassword'}, (err, opts) => { // encryption is just for testing, it won't be done like this

        var config = fs.readFileSync(__dirname + '/../config.json');
        console.log("Cleaning up...")
        console.log(config)
        fs.unlinkSync('config.json');

        exports.config = JSON.parse(config.toString('utf8'))
        console.log(config.toString('utf8'))

        return true;

      });
    }
  });

}

module.exports.finish = (captcha, item, request) => {

  return new Promise(

    (resolve, reject) => {

      console.log(item)
      request.post({url:'https://www.supremenewyork.com/checkout.json', form: {
        "order[billing_name]": item.billing_name,
        "order[email]": item.email,
        "order[tel]": item.tel,
        "order[billing_city]": item.billing_city,
        "order[billing_country]": item.billing_country,
        "order[billing_zip]": item.billing_zip,
        "order[billing_address]": item.billing_address,
        "same_as_billing_address": 1,
        "credit_card[type]": 'paypal', // paypal only for now
        "credit_card[month]": 09, // random month
        "credit_card[year]": 2018, // random year
        "order[terms]": 1,
        "g-recaptcha-response": captcha
      }},
      function(err,httpResponse,body){

        console.log(httpResponse.headers)
        console.log(body)
        console.log((new Date() - start) / 1000)
        body = body.replace(/\\u0026/g, '&')
        return resolve({url: JSON.parse(body).redirect_url, id: item.id});

      })

    }

  )

}

var cop = (url, item) => {

  var j = req.jar()
  var request = req.defaults({jar: j});

  return new Promise(

    (resolve, reject) => {

      console.log("Copping @ %s", url);
      request('https://www.supremenewyork.com' + url, (err, res, body) => {

        var $ = cheerio.load(body), size;
        var style = $("#style").attr('value');
        var action = $("#cart-addf").attr('action')
        console.log("Style selected: " + style)
        console.log("Action: " + action)

        if($("#size option").length){

          $("#size option").each((i, el) => {

            // size
            if($(el)[0].children[0].data == item.size){

              console.log($(el)[0])
              size = $(el)[0].attribs.value;

            }

          })

          if(!size)
            reject({error: 'size_not_found'})

            console.log(item.size)

            request.post(
              {url:'https://www.supremenewyork.com/shop/'+action.split("/")[2]+'/add.json',
              form: {utf8: '✓', style: style, size: size, commit: 'add to basket'}},
              function(err, resp, body){

                  if(err)
                    reject({error: err});

                console.log(body)

                request.get('https://www.supremenewyork.com/checkout', async(err, resp, body) => {

                  console.log(body)

                  return resolve({item: item, request: request})

                })


            })

        }else{

          reject({error: 'item_sold_out'})

        }

      })

    }

  )

}

var search = (name, type, color) => {

  return new Promise(

    (resolve, reject) => {

      console.log(name, type)
      req('https://www.supremenewyork.com/shop/all/' + type, (err, res, body) => {

        var d = new Date();
        var $ = cheerio.load(body);

        var url = $("article .inner-article").map((item) => {
          var i = $($(".inner-article h1")[item]).html();
          var ic = $($(".inner-article p")[item]).html();
          var item_color = new RegExp("\<a .+\>(.*)<\/a\>");
          var link = new RegExp(/href="(.*?)"/)

          if(name === i.match(item_color)[1] && color === ic.match(item_color)[1])
            return ic.match(link)[1];

        })

        const filters = /\b(?:movie|food)\b/
        const result = contents.filter(content => filters.test(content.name))

        console.log("Time elapsed to find %s - %s: %s seconds", name, color, (new Date() - d) / 1000)
        console.log(url[0])

        if(typeof url[0] === 'undefined'){

          console.log("not found, probably retrying...")
          search(name, type, color);
          // add timeout 
          return;

        }

        return resolve(url[0])

      })

    }

  )

}
