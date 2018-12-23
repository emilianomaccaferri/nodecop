const EventEmitter = require('events');

class Waiter extends EventEmitter{

  hey(){
    this.emit('hey')
  }

}

module.exports = Waiter;
