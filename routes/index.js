/**
 * Sums top logic behind routing of API. It includes all routes files, binds
 * them into express.Router with proper mapping.
 *
 * @module Router
 */

module.exports = function(app) {

  var routes = require('./main');
  var users = require('./user');

  var results = require('./results');
  var settask = require('./settask');
  var computeStart = require('./computestart');
  var computing = require('./computing');
  var admin = require('./admin');
  var samples = require('./sample');
  var patterns = require('./pattern');

  app.use('/', routes);
  app.use('/admin', admin);
  app.use('/users', users);
  app.use('/results', results);
  app.use('/settask', settask);
  app.use('/computestart', computeStart);
  app.use('/computing', computing);
  app.use('/samples', samples);
  app.use('/patterns', patterns);

}
