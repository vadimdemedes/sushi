# sushi [![Circle CI](https://circleci.com/gh/vdemedes/sushi.svg?style=svg)](https://circleci.com/gh/vdemedes/sushi)

Express for CLI apps.


### Installation

```
$ npm install sushi --save
```


### Usage

*myapp.js*:

```js
var sushi = require('sushi');

var app = sushi();

app.on('start', function () {
  console.log('start command');
});

app.on('stop', function () {
  console.log('stop command');
});

app.on('index', function () {
  console.log('index command');
});

app.run();
```

```
$ node myapp.js start
start command

$ node myapp.js stop
stop command

$ node myapp.js
index command
```


### Arguments

Program arguments are parsed using [minimist](https://npmjs.org/package/minimist).
Each command gets parsed arguments using `minimist` in a first argument:

```js
app.on('start', function (args) {
  var name = args._[0];

  var delay = args.delay;

  console.log('start', name, 'with', delay, 'delay');
});
```

```
$ node myapp.js start my-process --delay 500ms
start my-process with 500ms delay
```

You can also customize the way `minimist` parses arguments by passing options (see [minimist](https://www.npmjs.com/package/minimist#var-argv-parseargs-args-opts)):

```js
app.run(argv, {
  boolean: ['verbose']
});
```


### Index command

Index command can be assigned using `.on('index', fn)`.
It will be executed, when no other commands match.

```js
app.on('index', function (args) {
  console.log('index command');
});
```

```
$ node myapp.js
index command
```


### Middleware

Middleware is a function, that modifies the context or arguments before target command is executed.

```js
app.use(function (args, context, next) {
  context.ok = true;

  // call `next()` when done
  next();
});

app.on('start', function (args, context) {
  context.ok === true; // true

  console.log('start command');
});
```

Middleware can also abort command:

```js
app.use(function (args, context, next) {
  var err = new Error('Fatal error');

  next(err);
});

app.on('start', function (args, context) {
  // won't be executed
});

app.on('error', function (err) {
  // err is the Error instance from middleware

  err.message === 'Fatal error'; // true
});
```


### Tests

[![Circle CI](https://circleci.com/gh/vdemedes/sushi.svg?style=svg)](https://circleci.com/gh/vdemedes/sushi)

```
$ make test
```


### License

MIT © [Vadym Demedes](http://vadimdemedes.com)
