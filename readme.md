# sushi

[![Build Status](https://travis-ci.org/vdemedes/sushi.svg?branch=master)](https://travis-ci.org/vdemedes/sushi)
[![Coverage Status](https://coveralls.io/repos/github/vdemedes/sushi/badge.svg?branch=master)](https://coveralls.io/github/vdemedes/sushi?branch=master)

Express-like framework for CLI apps.

<h1 align="center">
	<br>
	<img width="300" src="media/header.png">
	<br>
	<br>
	<br>
</h1>


## Installation

```
$ npm install sushi --save
```


## Usage

*myapp.js*:

```js
const sushi = require('sushi');

const app = sushi();

app.command('start', function () {
  console.log('start command');
});

app.command('stop', function () {
  console.log('stop command');
});

app.command('index', function () {
  console.log('index command');
});

app.run();
```

Output:

```
$ node myapp.js start
start command

$ node myapp.js stop
stop command

$ node myapp.js
index command
```


## Getting Started

- [Arguments](#arguments)
- [Index command](#index-command)
- [Middleware](#middleware)
- [Error handling](#error-handling)

### Arguments

Program arguments are parsed using [minimist](https://npmjs.org/package/minimist).
Command can access arguments via `req.args`:

```js
app.command('start', function (req) {
  var name = req.args._[0];
  var delay = req.args.delay;

  console.log('start', name, 'with', delay, 'delay');
});
```

```
$ node myapp.js start my-process --delay 500ms
start my-process with 500ms delay
```

You can also customize the way `minimist` parses arguments by passing `args` options (see [minimist](https://www.npmjs.com/package/minimist#var-argv-parseargs-args-opts)):

```js
const app = sushi({
	args: {
		boolean: ['verbose']
	}
});
```

### Index command

Index command is executed when other commands don't match the arguments:

```js
app.command('index', function () {
  console.log('index command');
});
```

```
$ node myapp.js
index command

$ node myapp.js hello
```

### Middleware

Middleware is a function, that modifies the context or arguments before target command is executed.

```js
app.use(function (req, next) {
  req.context.ok = true;

  // call `next()` when done
  next();
});

app.command('start', function (req) {
  req.context.ok === true; // true

  console.log('start command');
});
```

Middleware can also abort execution:

```js
app.use(function (req, next) {
  var err = new Error('Fatal error');
  next(err);
});

app.command('start', function (req) {
  // won't be executed
});

app.on('error', function (err) {
  // err is the Error instance from middleware
  err.message === 'Fatal error'; // true
});
```

### Error handling

When one of the middleware or command itself throws an error,
`error` event is emitted:

```js
app.on('error', function (err) {
	// err is the Error instance
});
```

You can use it to display a friendly error message, report it, etc.


## List of middleware

Here's the list of middleware you can use with Sushi:

- [help](https://github.com/vdemedes/sushi-help) - help messages


## Tests

```
$ npm test
```


## License

MIT © [Vadym Demedes](http://vadimdemedes.com)
