'use strict';

/**
 * Dependencies
 */

const sushi = require('./');
const test = require('ava');


/**
 * Tests
 */

test('match command', t => {
	t.plan(1);

	let app = sushi();

	app.on('start', function () {
		t.pass();
	});

	app.on('stop', function () {
		t.fail();
	});

	app.run(['start']);
});

test('match correct commands with similar names', t => {
	t.plan(3);

	let app = sushi();

	app.on('start', function (args) {
		t.is(args.a, 'y');
	});

	app.on('started', function (args) {
		t.is(args.b, 'y');
	});

	app.on('starts', function (args) {
		t.is(args.c, 'y');
	});

	app.run(['start', '--a', 'y']);
	app.run(['started', '--b', 'y']);
	app.run(['starts', '--c', 'y']);
});

test('parse arguments', t => {
	t.plan(4);

	let app = sushi();

	app.on('start', function (args) {
		t.is(Object.keys(args).length, 2);
		t.is(args.a, true);

		t.is(args._.length, 1);
		t.is(args._[0], 'some-value');
	});

	app.run(['start', '-a', 'true', 'some-value'], {
		boolean: ['a']
	});
});

test('index command', t => {
	t.plan(1);

	let app = sushi();

	app.on('index', function () {
		t.pass();
	});

	app.run([]);
});

test('index command with arguments', t => {
	t.plan(4);

	let app = sushi();

	app.on('index', function (args) {
		t.is(Object.keys(args).length, 2);
		t.is(args.a, 'true');

		t.is(args._.length, 1);
		t.is(args._[0], 'some-value');
	});

	app.run(['some-value', '-a', 'true']);
});

test('404 command', t => {
	t.plan(1);

	let app = sushi();

	app.on('404', function () {
		t.pass();
	});

	app.run(['some-value', '-a', 'true']);
});

test('use middleware', t => {
	t.plan(1);

	let app = sushi();

	app.use(function (args, context, next) {
		context.ok = true;
		next();
	});

	app.on('start', function (args, context) {
		t.true(context.ok);
	});

	app.on('stop', function () {
		t.fail();
	});

	app.run(['start']);
});

test('emit error when middleware fails', t => {
	t.plan(1);

	let app = sushi();

	app.use(function (args, context, next) {
		next(new Error('Error message'));
	});

	app.on('start', function () {
		t.fail();
	});

	app.on('error', function (err) {
		t.is(err.message, 'Error message');
	});

	app.run(['start']);
});

