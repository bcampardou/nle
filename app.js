'use strict';

var express = require('express')
    , app = express()
    , path = require('path')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , config = require('config')
    , methodOverride = require('method-override')
    , routes = require('./routes/index')
    , log = require('./routes/log')
    , admin = require('./routes/admin')
    , keytool = require('./key-tool');
const readline = require('readline');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var adminKeyHandler = function(answer) {
    if(answer === 'y' || answer === 'Y') {
        keytool.register('*', function(error, reply) {
            console.info("Your API Key for administration is: " + reply + "\nIt lets you access any host logs.\nPlease write it carefully.");
        });
    }
    rl.close();
}


keytool.find('*', function(error, reply) {
    if(reply === null) {
        // There is no api key for administration.
        // Ask the user if he wants to create one now.
        rl.question("There is no api key for administration.\nWould you like to register one now (y/n)? ", adminKeyHandler);
        
    }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(cookieParser())
    .use(express.static(path.join(__dirname, 'public')))
    .use(methodOverride('_method'));

console.info('Registering routes');
// Allow cross origins requests (CORS)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
    .use('/', routes)
    .use('/log', log)
    .use('/admin', admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.statusCode = 404;
  res.send(err.message);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.statusCode = err.status || 500;
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.statusCode = err.status || 500;
        res.render('error', {
            message: err.message,
            error: {}
        });
    });    
}


module.exports = app;
