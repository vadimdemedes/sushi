'use strict';

/**
 * Dependencies
 */

var EventEmitter = require('events');
var inherits = require('util').inherits;
var minimist = require('minimist');
var each = require('each-series');


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

Sushi.prototype._detectCommand = function (argv, options) {
  var args = minimist(argv, options);
  var length = args._.length;

  var command;

  loop: while (length > 0) {
    // list of arguments
    var list = args._.slice(0, length--).join(' ') + ' ';

    var i = 0;

    while (i < this.commands.length) {
      // current command name
      var name = this.commands[i].name;

      var isMatch = list.indexOf(name + ' ') >= 0;

      if (isMatch) {
        command = this.commands[i];

        // remove command name from arguments
        args._ = list.replace(name + ' ', '').trim().split(' ');
        argv = argv.join(' ').replace(name + ' ', '').trim().split(' ');

        break loop;
      }

      i++;
    }
  }

  if (command) {
    return {
      name: command.name,
      args: args,
      argv: argv
    };
  } else {
    // if command was not found:
    //  1. return index command, if it exists
    //  2. return 404 command
    command = this._findIndexCommand();

    if (command) {
      return {
        name: 'index',
        args: args,
        argv: argv
      };
    } else {
      return {
        name: '404',
        args: args,
        argv: argv
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

Sushi.prototype.run = function (argv, options) {
  if (!argv) {
    argv = process.argv.slice(2);
  }

  var command = this._detectCommand(argv, options);
  var context = {};
  var self = this;

  context.args = command.args;
  context.argv = command.argv;

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
