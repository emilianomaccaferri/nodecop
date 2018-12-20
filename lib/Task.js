'use strict'

const request = require('request-promise');
const req = request.defaults({jar: true});
const events = require('events');
const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

var Task = function(item) {

  this.item = item
  this.stopped = false;

  this.getId = () => { return this.item.task_id }

  this.stop = () => { this.stopped = true }

  this.run = async() => {

      var s = await this._searchItem(this.item.item_name, this.item.item_type, this.item.item_color)
      this.emit('searching')
      var url = s[0].match(/href="(.*?)"/g)[0].split("=")[1].replace(/['"]+/g, ''); // yee chain of regexes, idk why the output of searchItem is garbage...
      var item = await this._getItem(url, this.item.item_size);

      console.log(item);

  }

  this._getItem = async(url, size) => {

    console.log(size);

    var $ = await req({
      uri: 'https://www.supremenewyork.com' + url,
      transform: (body) => {
        return cheerio.load(body)
      }
    })

    var style = $("#style").attr('value');
    var action = $("#cart-addf").attr('action');
    var sizes = $("#size option");
    var a = sizes.map(item => {

      if($(sizes[item]).html() === size)
        return {size: $(sizes[item]).attr('value').toString(), style: style.toString(), action: action.toString()}

      return null;

    })

    console.log("mmm");

    if(!size || !action || !style){
        console.log("sold out everyone...");
        this.emit('sold_out')
        return {error: 'sold_out'}
    }

    return a;

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
        return html_name_item;

      return null;

     })

     return a;

  }

};

function wordInString(string, keywords) {
    return string.split(/\b/).some(Array.prototype.includes.bind(keywords));
}

Task.prototype = new events.EventEmitter; // can handle events from the instance

module.exports = Task;
