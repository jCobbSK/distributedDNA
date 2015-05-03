/**
 * Main file for Javascript Distributive System Module (JDSM). It sets up sockets.io server
 * with provided http.Server instance. And returns Anl class instance, which provides available
 * API methods.
 *
 * @module JDSM
 *
 * @constructor
 * @param {http's module Server object} server
 */

module.exports = function(server) {
  var socketsIO = require('socket.io')(server);

  var anl = require('./anl')(socketsIO, {});

  return anl;
}