'use strict';

const test = require('ava');
const sushi = require('./');

test('match command', t => {
	const app = sushi();
	const stack = [];

	app.use('stop', () => {
		stack.push('stop');
	});

	app.use('start', () => {
		stack.push('start');
	});

	return app.run(['start']).then(() => {
		t.deepEqual(stack, ['start']);
	});
});

test('match correct commands with similar names', t => {
	const app = sushi();
	const stack = [];

	app.use('start', () => {
		stack.push('start');
	});

	app.use('started', () => {
		stack.push('started');
	});

	app.use('starts', () => {
		stack.push('starts');
	});

	return app.run(['start'])
		.then(() => app.run(['started']))
		.then(() => app.run(['starts']))
		.then(() => {
			t.deepEqual(stack, ['start', 'started', 'starts']);
		});
});

test('execute middleware', t => {
	const app = sushi();
	const stack = [];

	app.use('start', function * (next) {
		stack.push('first');
		yield next;
	});

	app.use('start', function * (next) {
		yield next;
		stack.push('third');
	});

	app.use('start', () => {
		stack.push('second');
	});

	return app.run(['start']).then(() => {
		t.deepEqual(stack, ['first', 'second', 'third']);
	});
});

test('explicit index command', t => {
	const app = sushi();
	const stack = [];

	app.use('index', () => {
		stack.push('index');
	});

	return app.run([]).then(() => {
		t.deepEqual(stack, ['index']);
	});
});

test('implicit index command', t => {
	const app = sushi();
	const stack = [];

	app.use('index', () => {
		stack.push('index');
	});

	return app.run(['hello']).then(() => {
		t.deepEqual(stack, ['index']);
	});
});

test('handle errors', t => {
	const app = sushi();
	let thrownErr;

	app.use(function * (next) {
		try {
			yield next;
		} catch (err) {
			thrownErr = err;
		}
	});

	app.use(() => {
		throw new Error('Oops');
	});

	return app.run([])
		.then(() => {
			t.true(thrownErr instanceof Error);
			t.is(thrownErr.message, 'Oops');
		});
});

test('fail on unhandled error', t => {
	const app = sushi();
	let thrownErr;

	app.on('error', err => {
		thrownErr = err;
	});

	app.use(() => {
		throw new Error('Oops');
	});

	return app.run([])
		.then(() => t.fail())
		.catch(err => {
			t.true(err instanceof Error);
			t.is(err, thrownErr);
			t.is(err.message, 'Oops');
		});
});

test('execute non-generator functions', t => {
	const app = sushi();
	const stack = [];

	app.use(function * (next) {
		stack.push('generator');
		yield next;
	});

	app.use(() => {
		stack.push('regular');
	});

	return app.run([]).then(() => {
		t.deepEqual(stack, ['generator', 'regular']);
	});
});

test('throw when non-generator function is not last', t => {
	const app = sushi();
	const stack = [];

	app.use(function * (next) {
		stack.push('generator');
		yield next;
	});

	app.use(() => {
		stack.push('regular');
	});

	app.use(function * () { // eslint-disable-line require-yield
		stack.push('generator');
	});

	let errorThrown = false;

	try {
		app.run([]);
	} catch (err) {
		errorThrown = true;

		t.deepEqual(stack, []);
		t.is(err.message, 'Non-generator function must be last in the middleware chain.');
	}

	if (!errorThrown) {
		t.fail('app.run() passed, but should\'ve failed.');
	}
});
