var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var models = require('./models');

//authorization modules
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var users = require('./routes/user');

var results = require('./routes/results');
var settask = require('./routes/settask');
var computeStart = require('./routes/computestart');
var computing = require('./routes/computing');
var admin = require('./routes/admin');
var samples = require('./routes/sample');
var patterns = require('./routes/pattern');

var app = express();

app.locals.title = 'DIPLOMOVKA';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({dest: './tmpUploads/'}));

app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/admin', admin);
app.use('/users', users);
app.use('/results', results);
app.use('/settask', settask);
app.use('/computestart', computeStart);
app.use('/computing', computing);
app.use('/samples', samples);
app.use('/patterns', patterns);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//PASSPORT authorization
passport.use(new LocalStrategy(
  function(username, password, done) {
    models.User.find({where:{username:username}}).then(function(user) {
      if (!user) {
        console.log('INCORRECT USERNAME');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        console.log('INCORRECT PASSWORD',user.password,password);
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    }).catch(function(err){
      return done(err);
    })
  }
));
passport.serializeUser(function(user,done){
  console.log('serializing', user);
  done(null,user);
});

passport.deserializeUser(function(obj,done){
  console.log('deserialize', obj);
  done(null, obj);
});


/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
