'use strict'

const request = require('request-promise');
const req = request.defaults({jar: true});
const events = require('events');
const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

var Task = function(item) {

  this.item = item

  this.run = async() => {

    var s = await this._searchItem(this.item.item_name, this.item.item_type, this.item.item_color)
    console.log(s);

  }

  this._searchItem = async(name, type, color) => {

    var $ = await req({
      uri: 'https://www.supremenewyork.com/shop/all/' + type,
      transform: (body) => {
        return cheerio.load(body)
      }
    })

     var a = $("article .inner-article").map((item) => {

       var html_name_item = $($(".inner-article h1")[item]).html();
       var html_name = entities.decode($($(".inner-article h1 a")[item]).html());
       var html_color = $($(".inner-article p a")[item]).html();

       if((wordInString(html_name, name.split(" ")) && html_color.toLowerCase() === color.toLowerCase()))
        return html_name_item.attr('href')

      return null;

     })

     return a;

  }

};

function wordInString(string, keywords) {
    return string.split(/\b/).some(Array.prototype.includes.bind(keywords));
}
// thanks https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

Task.prototype = new events.EventEmitter; // can handle events from the instance

module.exports = Task;
