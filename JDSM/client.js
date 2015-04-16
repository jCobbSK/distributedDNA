var socketIoClient = require('socket.io-client')
module.exports = function(socketUrl) {
  /**
   * Default socket object for communication with server.
   * @type {socket.client.io io object}
   */
  var socket = socketIoClient(socketUrl);

  socket.on('ping', function(){
    socket.emit('ping');
  });

  /**
   * @class
   * Class passed to task callback. It's purpose is to strap system data from request
   * and put them back for respond so user can't mess it up.
   */
  var RespondObject = function(serverData, socket) {
    var requestId = serverData['requestId'];
    var masterRequestId = serverData['masterRequestId'];
    var socket = socket;
    return {
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
     */
    socket: socket,

    /**
     * Register task based on eventName.
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
