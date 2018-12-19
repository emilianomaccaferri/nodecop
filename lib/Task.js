'use strict'

var events = require('events');

var Task = function(item) {

  this.item = item

};

Task.prototype = new events.EventEmitter; // can handle events from the instance

module.exports = Task;
