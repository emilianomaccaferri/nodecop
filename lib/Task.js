'use strict'

const utils = require('./Utils')
const request = require('request-promise');
const req = request.defaults({jar: true, headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
              'Content-Type': 'application/x-www-form-urlencoded'
              }
            });

const EventEmitter = require('events');
const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

class Task extends EventEmitter{

  constructor(item, group){

    super();
    this.item = item;
    this.group = group || undefined;
    this.stopped = false;
    this.checkouting = false;

  }

  get getId(){ return this.item.task_id; }
  stop(){ this.stopped = true; this.emit('stop'); }
  hey(captcha){ this.emit('hey', (captcha)) }

  async run(force){

    var d = (new Date().getTime())

    if(force)
      this.stopped = false;

    if(this.stopped)
      return;

    var profileID = this.item.profile_id;
    if(this.group){
      profileID = this.group.profile_id;
    }
    var profile = utils.config.profiles[profileID];

    console.log(profile);

    this.item.request = {
      "order[billing_name]": profile.name,
      "order[email]": profile.email,
      "order[tel]": profile.telephone,
      "order[billing_address]": profile.address,
      "order[billing_city]": profile.city,
      "order[billing_zip]": profile.zip,
      "order[billing_country]": profile.country,
      "same_as_billing_address": 1,
      "credit_card[type]": profile["credit_card[type]"],
      "credit_card[cnb]": profile["credit_card[cnb]"],
      "credit_card[month]": profile["credit_card[month]"],
      "credit_card[year]": profile["credit_card[year]"],
      "credit_card[vval]": profile["credit_card[vval]"],
      "order[terms]": 0,
      "order[terms]": 1
    }

    console.log(this.item.request);

    if(this.stopped)
      return;

    if(this.group){

      var process = [];
      this.group.items.forEach(item => {

        process.push(

          searchItem(item.item_name, item.item_type, item.item_color, item.item_size)

        )

      })

      await Promise.all(process)

    }else
      await searchItem(this.item.item_name, this.item.item_type, this.item.item_color, this.item.item_size);

    if(this.stopped)
      return;

    console.log("spigolino");
    if(utils.latestCaptchas.length == 0){
      this.emit('task-captcha', (this.task_id))
      this.on('hey', async(c) => {

        console.log((new Date().getTime() - d) / 1000);
        console.log(c);
        this.complete(c)

      })
    }else
      this.complete();

  }

  async complete(c){

    if(this.stopped)
      return;

    console.log(c);
    var r = this.item.request;
    var cap = utils.latestCaptchas.pop();
    r['g-recaptcha-response'] = c || cap;
    console.log(`Task woke up and is ready to be finished`);
    this.item.request["g-recaptcha-response"] = c || cap

    console.log(r);

    // paypal only for now, have to try with CC

    var out = await req({
      method: 'POST',
      uri: 'https://www.supremenewyork.com/checkout.json',
      form: this.item.request
    })

    out = out.replace(/\\u0026/g, '&')

    if(this.stopped)
      return;

    return this.emit('pay-url', [JSON.parse(out)["redirect_url"], out]);

  }

}

async function searchItem(name, type, color, size){

  try{

    var json = JSON.parse(await req('https://www.supremenewyork.com/mobile_stock.json'));
    var category = json["products_and_categories"][type];
    const id = category.filter(item => {

      if(wordInString(item.name, name.split(" "))){
          console.log("ID FOUND:" + item.id);
          return item;
      }

    })[0].id;

    var page = JSON.parse(await req(`https://www.supremenewyork.com/shop/${id}.json`))["styles"];

    const exactStyle = page.find(style => {

      if(color === style.name){

        return style["sizes"];

      }

    })

    const styleID = exactStyle.id;

    const c = exactStyle["sizes"].filter(item => item.stock_level > 0);

    console.log(c);

    const sizeID = c.find(s => { if(s.name === size) return s.id}) || c[0].id;

    await req({

      method: 'POST',
      uri: `https://www.supremenewyork.com/shop/${id}/add.json`,
      form: {
        utf8: '✓',
        style: styleID,
        size: sizeID,
        commit: 'add to basket'
      }
    })

    return true;

  }
  catch(err){

    throw err;

  }

}

function wordInString(string, keywords) {
    return string.split(/\b/).some(Array.prototype.includes.bind(keywords));
}

module.exports = Task;
