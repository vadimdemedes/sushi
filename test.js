'use strict';

/**
 * Dependencies
 */

const sushi = require('./');
const test = require('ava');


/**
 * Tests
 */

test.cb('match command', t => {
	t.plan(1);

	let app = sushi();

	app.command('start', function () {
		t.pass();
		t.end();
	});

	app.command('stop', function () {
		t.fail();
		t.end();
	});

	app.run(['start']);
});

test.cb('match correct commands with similar names', t => {
	t.plan(3);

	let app = sushi();

	app.command('start', function (req) {
		t.is(req.args.a, 'y');
	});

	app.command('started', function (req) {
		t.is(req.args.b, 'y');
	});

	app.command('starts', function (req) {
		t.is(req.args.c, 'y');
		t.end();
	});

	app.run(['start', '--a', 'y']);
	app.run(['started', '--b', 'y']);
	app.run(['starts', '--c', 'y']);
});

test.cb('parse arguments', t => {
	t.plan(2);

	let app = sushi({
		args: {
			boolean: ['a']
		}
	});

	app.command('start', function (req) {
		t.true(req.args.a);
		t.same(req.args._, ['some-value']);
		t.end();
	});

	app.run(['start', '-a', 'true', 'some-value']);
});

test.cb('index command', t => {
	t.plan(1);

	let app = sushi();

	app.command('index', function () {
		t.pass();
		t.end();
	});

	app.run([]);
});

test.cb('index command with arguments', t => {
	t.plan(2);

	let app = sushi({
		args: {
			boolean: ['a']
		}
	});

	app.command('index', function (req) {
		t.true(req.args.a);
		t.same(req.args._, ['some-value']);
		t.end();
	});

	app.run(['some-value', '-a', 'true']);
});

test.cb('404 command', t => {
	t.plan(1);

	let app = sushi();

	app.use(function (req) {
		if (!req.command) {
			t.pass();
			t.end();
			return;
		}

		t.fail();
		t.end();
	});

	app.run(['some-value', '-a', 'true']);
});

test.cb('use middleware', t => {
	t.plan(1);

	let app = sushi();

	app.use(function (req, next) {
		req.context.ok = true;
		next();
	});

	app.command('start', function (req) {
		t.true(req.context.ok);
		t.end();
	});

	app.run(['start']);
});

test.cb('emit error when middleware fails', t => {
	t.plan(1);

	let app = sushi();

	app.use(function (req, next) {
		next(new Error('Oops'));
	});

	app.command('start', function () {
		t.fail();
		t.end();
	});

	app.on('error', function (err) {
		t.is(err.message, 'Oops');
		t.end();
	});

	app.run(['start']);
});

test.cb('help message', t => {
	t.plan(1);

	let app = sushi({
		help: 'help message'
	});

	var oldConsoleLog = console.log;

	console.log = function (str) {
		t.is(str, 'help message');

		console.log = oldConsoleLog;
		t.end();
	};

	app.run(['-h']);
});
