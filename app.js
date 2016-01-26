var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var methodOverride = require('method-override');
var routes = require('./routes/index');
var log = require('./routes/log');
var admin = require('./routes/admin');
var keytool = require('./key-tool');
const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

var app = express();

keytool.find('*', function(error, reply) {
    if(reply === null) {
        // There is no api key for administration.
        // Ask the user if he wants to create one now.
        readline.question('There is no api key for administration.\nWould you like to register one now (y/n)? ', (answer) => {
            if(answer === 'y' || answer === 'Y') {
                keytool.register('*', function(error, reply) {
                    console.info("Your API Key for administration is: " + reply + "\nIt lets you access any host logs.\nPlease write it carefully.");
                });
            }
        });
        
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

console.info('Registering routes');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/', routes);
app.use('/log', log);
app.use('/adm', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.status(404);
  res.send(err.message);
  next(err);
});

app.param("hostname", function(req, res, next, hostname) {
  if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
    //hostname is invalid
    next(new Error('Hostname parameter is invalid'));
   else next();
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
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
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
    });    
}



var appConfig = config.get('App');
var listener = null;
var listenCallback = function() {
    console.info('Server listening on port : %d', listener.address().port);
}

listener = (appConfig == null || appConfig.port == null) ? app.listen(listenCallback) : app.listen(appConfig.port, listenCallback);


module.exports = app;
