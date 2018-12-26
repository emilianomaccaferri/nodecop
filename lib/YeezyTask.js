const request = require('request-promise');
const req = request.defaults({jar: true});
const cheerio = require('cheerio');
const fs = require('fs')
const Task = require("./Task")

class YeezyTask extends Task{

    constructor(item){

      super(item);
      console.log("asdasd");
      this.item = item;
      this.stopped = false;
      this.checkouting = false;

    }

    async run(){

      try{
        var yzy = await req({
          method: 'GET',
          uri: 'https://yeezysupply.com/collections/new-arrivals-footwear',
          //body: {"id": "12605134995555" /* so le calze */, "quantity": 1, "properties": {}}, // 1920524583040 static reflective
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
          },
          //json: true

        })

        var products = yzy.match(/<script id="js-featured-json" type="application\/json">(.*)<\/script>/)[1].slice(0, -1);

        console.log(products);
        fs.writeFileSync('test.txt', products)
        /*
        for(var i = 0, len = products["products"].length; i < len; i++){

          // small-sized array + loop with cached length = fast
          var name = products["products"][i].title.replace(/\n|\r/g, "");

          if(wordInString(name, this.item.yeezy.toUpperCase().split(" "))){
            console.log(products["products"][i]);
          }

        }*/

      }catch(err){

        console.log(err);
        this.emit('nope')

      }

    }

}

function wordInString(string, keywords) {
    return string.split(/\b/).some(Array.prototype.includes.bind(keywords));
}

module.exports = YeezyTask
