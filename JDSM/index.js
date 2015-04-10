/**
 * Main file for Javascript Distributive System Module (JDSM).
 *
 * @module JDSM
 *
 * @param {http's module Server object} server
 */

module.exports = function(server) {
  var socketsIO = require('socket.io')(server);

  var anl = require('./anl')(socketsIO, {});

  return anl;
}