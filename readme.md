# sushi [![Build Status](https://travis-ci.org/vdemedes/sushi.svg?branch=master)](https://travis-ci.org/vdemedes/sushi) [![Coverage Status](https://coveralls.io/repos/github/vdemedes/sushi/badge.svg?branch=master)](https://coveralls.io/github/vdemedes/sushi?branch=master)

> Koa-like framework for CLI tools. Everything is a middleware.

<h1 align="center">
	<br>
	<img width="200" src="media/header.png">
	<br>
	<br>
	<br>
</h1>

## Installation

```
$ npm install sushi --save
```

## Usage

*mycli.js*:

```js
const sushi = require('sushi');
const parse = require('sushi-parse');
const help = require('sushi-help');

const app = sushi();

app.use(parse());

app.use('hello', help('Help for "hello" command'));
app.use('hello', () => {
  console.log('hello command');
});

app.use('index', help('Help for "index" command'));
app.use('index', () => {
  console.log('index command');
});

app.run();
```

Output:

```
$ node mycli.js hello
hello command

$ node mycli.js hello --help
Help for "hello" command

$ node mycli.js
index command

$ node mycli.js --help
Help for "index" command
```

## Getting Started

Sushi is a middlewayer layer for CLI apps. It's what Connect is to Express.

### Create an app

To initialize Sushi, create its instance, called an "app":

```js
const app = sushi();
```

### Use middleware

Middleware are generator functions, executed one-by-one (serially) until a function does not call `next`,
which passes execution onto the next middleware. 

```js
app.use(function * middleware1(next) {
  yield next;
});

app.use(function * middleware2(next) {
	yield next;
});
```

Middleware can also abort execution by throwing an error:

```js
app.use(function * (next) {
  throw new Error('Fatal error');
});

app.use(function * (next) {
  // won't be executed
});
```

### Mount middleware

The `.use()` method also takes an option path string that is matched against the first non-flag argument.

```js
app.use('start', function * (next) {
	console.log('first');
	yield next;
});

// equivalent to app.use(fn)
app.use('*', function * (next) {
	console.log('second');
	yield next;
});
```

Output:

```
$ node mycli.js start
first
second

$ node mycli.js stop
second
```

### Error handling

Error handling is the same as in Koa framework. Write a middleware that wraps next middleware into `try/catch`:

```js
app.use(function * (next) {
	try {
		yield next;
	} catch (err) {
		// handle error
	}
});
```

When one of the middleware or command itself throws an error, `error` event is emitted:

```js
app.on('error', err => {
	// err is the Error instance
});
```

You can use it to display a friendly error message, report it, etc.

### Commands

Command is the last function in the middleware stack.
Unlike middleware, it can be anything: async function, "regular" function or function that returns a Promise.
Make sure you add commands after the middleware.

```js
app.use('start', () => {
	// regular function
});

app.use('stop', async () => {
	// async function
});

app.use('restart', () => {
	// function that returns a Promise
	return Promise.resolve();
});

app.use('shutdown', function * () {
	// and of course, generator function
});
```

### Run application

After all the middleware is added, run the application using `.run()` method.

```js
app.run();
```

Optional array of arguments can be supplied to be used instead of `process.argv` when parsing arguments.

```js
const argv = ['my', 'fake', 'arguments'];
app.run(argv);
```

The `.run()` method returns a Promise, so you can get notified when the application finishes its execution or an error is thrown.

```js
app.run()
	.then(() => {
		// all done
	})
	.catch(err => {
		// oh no, there's an error
	});
```

## Middleware

Here's the list of middleware you can use with Sushi:

- [help](https://github.com/vdemedes/sushi-help) - help messages

## License

MIT © [Vadym Demedes](http://vadimdemedes.com)
