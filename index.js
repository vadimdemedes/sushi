'use strict';

/**
 * Dependencies
 */

var EventEmitter = require('events');
var inherits = require('util').inherits;
var minimist = require('minimist');
var each = require('each-async');


/**
 * Expose Sushi
 */

module.exports = Sushi;


/**
 * Sushi
 */

function Sushi () {
  if (!(this instanceof Sushi)) return new Sushi();

  this.middleware = [];
  this.commands = [];

  EventEmitter.call(this);
}

inherits(Sushi, EventEmitter);


/**
 * Add new middleware
 *
 * @param {Function} fn
 * @api public
 */

Sushi.prototype.use = function (fn) {
  this.middleware.push(fn);
};


/**
 * Add new listener
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

Sushi.prototype.on = function (name) {
  this.commands.push({
    name: name
  });

  EventEmitter.prototype.on.apply(this, arguments);
};


/**
 * Return index command
 *
 * @api private
 * @return {Object}
 */

Sushi.prototype._findIndexCommand = function () {
  return this.commands.find(function (command) {
    return command.name === 'index';
  });
};


/**
 * Detect command from argv
 *
 * @param  {Array} argv
 * @api private
 * @return {Object}
 */

Sushi.prototype._detectCommand = function (argv) {
  var args = minimist(argv);

  var length = args._.length;

  var command;

  loop: while (length > 0) {
    var list = args._.slice(0, length--);
    var path = list.join(' ');

    var i = 0;

    while (i < this.commands.length) {
      var isMatch = path.indexOf(this.commands[i].name) >= 0;

      if (isMatch) {
        command = this.commands[i];

        args._ = path.replace(this.commands[i].name + ' ', '').split(' ');

        break loop;
      }

      i++;
    }
  }

  if (command) {
    return {
      name: command.name,
      args: args
    };
  } else {
    var args = minimist(argv);

    command = this._findIndexCommand();

    if (command) {
      return {
        name: 'index',
        args: args
      };
    } else {
      return {
        name: '404',
        args: args
      };
    }
  }
};


/**
 * Parse argv and run an app
 *
 * @param  {Array} argv
 * @api public
 */

Sushi.prototype.run = function (argv) {
  if (!argv) {
    argv = process.argv;
  }

  var self = this;

  var command = this._detectCommand(argv);
  var context = {};

  each(this.middleware, function (fn, index, next) {
    fn(command.args, context, next);
  }, function (err) {
    if (err) {
      self.emit('error', err);
      return;
    }

    self.emit(command.name, command.args, context);
  });
};
