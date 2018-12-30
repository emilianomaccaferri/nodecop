'use strict'

const request = require('request-promise');
const req = request.defaults({jar: true});
const EventEmitter = require('events');
const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

class Task extends EventEmitter{

  constructor(item){
    super();
    this.item = item;
    this.stopped = false;
    this.checkouting = false;
  }
  get getId(){ return this.item.task_id; }
  stop(){ this.stopped = true; this.emit('stop'); }
  hey(captcha){ this.emit('hey', (captcha)) }
  async run(force){

    if(force)
      this.stopped = false;

    if(this.stopped)
      return;

    var s = await this._searchItem(this.item.item_name, this.item.item_type, this.item.item_color)
    this.emit('searching')
    var url = s.match(/href="(.*?)"/g)[0].split("=")[1].replace(/['"]+/g, ''); // yee chain of regexes, idk why the output of searchItem is garbage...

    if(this.stopped)
      return;

    var item = await this._getItem(url, this.item.item_size);

    if(item == null){
      this.emit('error', {error: 'size_unavailable'})
      return;
    }

    if(this.stopped)
      return;

    var add = await req({
      method: 'POST',
      uri: 'https://www.supremenewyork.com/shop/' + item.action.split("/")[2] + "/add.json",
      body: {utf8: '✓', style: item.style, size: item.size, commit: 'add to basket'},
      json: true
    })

    var checkout = await req('https://www.supremenewyork.com/checkout');

    if(this.stopped)
      return;

    this.emit('task-captcha', (this.task_id));

    if(this.stopped)
      return;

    this.on('hey', async(c) => {

      if(this.stopped)
        return;

      console.log("ITEM HERE =============");
      var r = this.item.request;
      r['credit_card[month]'] = 9;
      r['g-recaptcha-response'] = c
      console.log(`Task woke up and is ready to be finished`);
      this.item.request["g-recaptcha-response"] = c;
      console.log(this.item);

      // paypal only for now, have to try with CC

      var out = await req({
        method: 'POST',
        uri: 'https://www.supremenewyork.com/checkout.json',
        form: this.item.request
      })
      out = out.replace(/\\u0026/g, '&')

      if(this.stopped)
        return;

      this.emit('pay-url', [JSON.parse(out)["redirect_url"], out]);

    })

  }

  async _getItem(url, size){

    if(this.stopped)
      return;

    var $ = await req({
      uri: 'https://www.supremenewyork.com' + url,
      transform: (body) => {
        return cheerio.load(body)
      }
    })

    var style = $("#style").attr('value');
    var action = $("#cart-addf").attr('action');
    var sizes = $("#size option");
    var a = null;
    for(var item = 0, len = sizes.length; item < len; item++)

      if($(sizes[item]).html() === size){//dorlock
          a = {size: $(sizes[item]).attr('value').toString(), style: style.toString(), action: action.toString()}
          break;
      }

    if(!size || !action || !style){
        console.log("sold out everyone...");
        this.emit('sold_out')
        return {error: 'sold_out'}
    }

    return a;

  }

  async _searchItem(name, type, color){

    if(this.stopped)
      return;

    var $ = await req({
      uri: 'https://www.supremenewyork.com/shop/all/' + type,
      transform: (body) => {
        return cheerio.load(body)
      }
    })

    var actualItem = null;

    for(var item = 0, len = $("article .inner-article").length; item < len; item++){
      // a for loop seems faster than any other iteration...
      var html_name_item = $($(".inner-article h1")[item]).html();
      var html_name = entities.decode($($(".inner-article h1 a")[item]).html());
      var html_color = $($(".inner-article p a")[item]).html();
      if((wordInString(html_name, name.split(" ")) && html_color.toLowerCase() === color.toLowerCase())){

         console.log("foundd");
         actualItem = html_name_item;
         break;

      }

    }

     return actualItem;

  }

}

function wordInString(string, keywords) {
    return string.split(/\b/).some(Array.prototype.includes.bind(keywords));
}

module.exports = Task;
