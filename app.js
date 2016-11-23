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

keytool.find('*', function(error, reply) {
    if(reply === null) {
        // There is no api key for administration.
        console.info("There is no api key for administration. An api key will automatically be registered.")
        keytool.register('*', function(error, reply) {
            if(error != null) {
                console.error(error.message);
                return;
            }

            console.warn("Your API Key for administration is: " + reply);
            console.info("\nIt lets you access any host logs.\nPlease write it carefully.");
        });
    }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
