/**
 * Client class handling front-end interaction. It is required to browserify this class and/or
 * any classes which are using this before use. It automatically injects sockets.io-client script.
 * @class Client
 * @module JDSM
 * @constructor
 * @param {Url string} socketUrl - socket server address (default http://localhost:3000)
 */
var socketIoClient = require('socket.io-client'),
  randomString = require('randomstring');
module.exports = function(socketUrl) {
  /**
   * Default socket object for communication with server.
   * @property socket
   * @private
   * @type {socket.client.io io object}
   */
  var socket = socketIoClient((socketUrl) ? socketUrl : 'http://localhost:3000');

  /**
   * Ping client handler.
   */
  socket.on('ping', function(data){
    socket.emit('ping', data);
  });

  /**
   * Benchmark client handler.
   */
  socket.on('benchmark', function(data){
    var received = Date.now();
    //do benchmark tests on data
    var dataString = data['randomString'];
    for (var i= 0, len = 1000; i<len; i++) {
      //generate regexp string
      var regExp = new RegExp(randomString.generate(25));
      regExp.test(dataString);
    }
    var calculationsDone = Date.now();
    socket.emit('benchmark', {
      data: data['randomString'],
      sendTimestamp: data['sendTimestamp'],
      receivedTimestamp: received,
      calculationsDoneTimestamp: calculationsDone
    });
  });

  /**
   * Class passed to task callback. It's purpose is to strap system data from request
   * and put them back for respond so user can't mess it up.
   * @class RespondObject
   * @for RespondObject
   * @constructor
   * @param {Object} serverData
   * @param {socket.io-client Socket} socket
   */
  var RespondObject = function(serverData, socket) {
    /**
     * @property requestId
     * @type Integer
     * @private
     */
    var requestId = serverData['requestId'];

    /**
     * @property masterRequestId
     * @type Integer
     * @private
     */
    var masterRequestId = serverData['masterRequestId'];

    /**
     * @property socket
     * @type {socket.io socket object}
     * @private
     */
    var socket = socket;
    return {
      /**
       * Respond method used as middleware to set required ids of request.
       * @method respond
       * @param {Object} data
       */
      respond: function(data) {
        data['requestId'] = requestId;
        data['masterRequestId'] = masterRequestId;
        socket.emit('results', data);
      }
    }
  }

  return {
    /**
     * Browserify close scopes, so public method doesn't have access to privates, so
     * we need to set a property.
     * @property socket
     * @type {socket.io socket object}
     */
    socket: socket,

    /**
     * Register task based on eventName.
     * @method registerTask
     * @param {string} eventName
     * @param {function(string: eventName, function(data, respondObject)} callback
     */
    registerTask: function(eventName, callback) {
      this.socket.on(eventName, function(data){
        callback(data, new RespondObject(data, socket));
      });
    }
  }
}
