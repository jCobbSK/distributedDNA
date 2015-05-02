/**
 * Custom middleware module for setting up authorization module and
 * username+password auth with method for generating authentification
 * middleware for filtering based on defined roles (node, client, admin).
 *
 * @class Authentification
 * @module Custom
 */
var passport = require('passport');
var models = require('../models');
module.exports = {

  /**
   * Initialize all authorization + authentification middlewares and dependencies
   * @method init
   * @param {expressjs app instance} app
   */
  init: function(app) {
    //authorization modules
    var session = require('express-session');
    var LocalStrategy = require('passport-local').Strategy;

    app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
    app.use(passport.initialize());
    app.use(passport.session());

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
          app.locals.user = user;
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
  },

  /**
   * Sets authenticate strategy and success and failure redirects.
   * @method authenticate
   * @returns {passport.authenticate instance}
   */
  authenticate : function() {
    return passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/'
    });
  },

  /**
   * Our role based authentification function. It returns middleware for filtering
   * access by our defined roles (node, client, admin).
   * @method roleAuthenticate
   * @param {Array of strings} roles
   * @returns {Middleware function}
   */
  roleAuthenticate: function(roles) {
    return function(req, res, next) {
      var loggedUser = req.user;
      if (!loggedUser) {
        console.log('redirecting loggedUser unknown');
        res.redirect('/');
        return;
      }

      var result = false;
      for (var i= 0, len=roles.length;i<len;i++) {
        switch(roles[i]){
          case 'node':
            if (!loggedUser.isClient)
              result = true;
            break;
          case 'client':
            if (loggedUser.isClient)
              result = true;
            break;
          case 'admin':
            if (loggedUser.isAdmin)
              result = true;
            break;
        }
      }

      if (!result) {
        console.log('redirecting result false', roles, loggedUser.isAdmin,loggedUser.isClient);
        res.redirect('/');
        return;
      }

      next();
    }
  }
}