'use strict';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;
const isGeneratorFn = require('is-generator-fn');
const pathToRegexp = require('path-to-regexp');
const isPromise = require('is-promise');
const minimist = require('minimist');
const compose = require('koa-compose');
const co = require('co');

function Sushi() {
	if (!(this instanceof Sushi)) {
		return new Sushi();
	}

	EventEmitter.call(this);

	this.stack = [];
}

module.exports = Sushi;
inherits(Sushi, EventEmitter);

Sushi.prototype.use = function (path, fn) {
	if (path === 'index') {
		path = '';
	}

	if (typeof path === 'function') {
		fn = path;
		path = '*';
	}

	this.stack.push({
		path: pathToRegexp(path),
		fn: fn
	});

	return this;
};

Sushi.prototype.run = function (argv) {
	if (!argv) {
		argv = process.argv.slice(2);
	}

	const args = minimist(argv);
	const path = args._[0] || '';
	if (path) {
		argv.splice(argv.indexOf(path), 1);
	}

	const context = {
		path: path,
		argv: argv
	};

	// first try to find an exact `path` match among middleware
	let stack = this.stack.filter(item => item.path.test(path));

	// if no exact match found, try to find an `index` middleware
	if (stack.length === 0) {
		stack = this.stack.filter(item => item.path.test(''));
	}

	stack = stack.map((item, index) => {
		if (isGeneratorFn(item.fn)) {
			return item.fn;
		}

		if (index !== stack.length - 1) {
			const err = new Error('Non-generator function must be last in the middleware chain.');
			throw err;
		}

		// convert last non-generator function into a generator function
		return function * (next) {
			const ret = item.fn();

			// if promise is returned, wait for its execution
			if (isPromise(ret)) {
				yield ret;
			}

			yield next;
		};
	});

	return co
		.wrap(compose(stack))
		.call(context)
		.catch(err => {
			this.emit('error', err);

			return Promise.reject(err);
		});
};
