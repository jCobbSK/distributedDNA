/**
 * Main file for Javascript Distributive System Module (JDSM).
 *
 * @module JDSM
 *
 * @constructor
 * @param {http's module Server object} server
 */

module.exports = function(server) {
  var socketsIO = require('socket.io')(server);

  socketsIO.on('connection', function(socket){
    console.log('Somebody CONNECTED');
  });

  var anl = require('./anl')(socketsIO, {});

  return anl;
}