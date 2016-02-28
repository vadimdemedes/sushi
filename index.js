'use strict';

/**
 * Dependencies
 */

var EventEmitter = require('events').EventEmitter;
var setImmediate = require('set-immediate-shim');
var inherits = require('util').inherits;
var minimist = require('minimist');
var each = require('each-series');


/**
 * Sushi
 */

function Sushi (options) {
	if (!(this instanceof Sushi)) {
		return new Sushi(options);
	}

	if (!options) {
		options = {};
	}

	// custom data for each command
	this.commandOptions = {};

	this.middleware = [];
	this.commands = {};
	this.options = options;

	EventEmitter.call(this);
}

inherits(Sushi, EventEmitter);

Sushi.prototype.use = function (fn) {
	this.middleware.push(fn);

	return this;
};

Sushi.prototype.command = function (name, options, fn) {
	if (typeof options === 'function') {
		fn = options;
		options = {};
	}

	this.commands[name] = fn;
	this.commandOptions[name] = options;

	return this;
};

Sushi.prototype.run = function (argv) {
	var self = this;

	if (!argv) {
		argv = process.argv.slice(2);
	}

	var args = minimist(argv, this.options.args);
	var name = args._[0] || 'index';

	if (!this.commands[name]) {
		name = 'index';
	}

	if (name !== 'index') {
		args._.shift();
	}

	var command = this.commands[name] || null;
	var options = this.commandOptions[name] || {};

	var req = {
		command: command,
		options: options,
		context: {},
		argv: argv,
		args: args,
		name: name
	};

	var middleware = [].slice.call(this.middleware);
	middleware.push(exec);

	each(middleware, function (fn, i, next) {
		setImmediate(function () {
			fn.call(self, req, next);
		});
	}, function (err) {
		if (err) {
			self.emit('error', err);
		}
	});
};


/**
 * Middleware
 */

function exec (req, next) {
	req.command(req);
	next();
}


/**
 * Expose module
 */

module.exports = Sushi;
