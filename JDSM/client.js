/**
 * Client class handling front-end interaction. It is required to browserify this module before
 * use.
 * @class Client
 * @module JDSM
 * @param {Url string} socketUrl - socket server address (default http://localhost:3000)
 */
var socketIoClient = require('socket.io-client')
module.exports = function(socketUrl) {
  /**
   * Default socket object for communication with server.
   * @property socket
   * @private
   * @type {socket.client.io io object}
   */
  var socket = socketIoClient((socketUrl) ? socketUrl : 'http://localhost:3000');

  socket.on('ping', function(){
    socket.emit('ping');
  });

  /**
   * Class passed to task callback. It's purpose is to strap system data from request
   * and put them back for respond so user can't mess it up.
   * @class RespondObject
   * @for Client
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
