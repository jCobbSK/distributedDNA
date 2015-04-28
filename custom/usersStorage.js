/**
 * Storage class for connected users so it is possible to real-time update progress
 * of analyzing particular sample.
 *
 * @class UsersStorage
 * @module Custom
 */
var _ = require('underscore');
module.exports = (function(){

  /**
   * Object property where key represents userId-s and values are sockets of particular
   * user.
   * @property sockets
   * @private
   * @type {Object}
   */
  var sockets = {};

  return {
    /**
     * Add user's socket to storage.
     * @method addSocket
     * @param {socket.io Client} socket
     * @param {integer} userId
     */
    addSocket: function(socket, userId) {
      sockets[userId] = socket;
    },

    /**
     * Removes user from storage by socket.
     * @method removeSocketBySocket
     * @param {socket.io Client} socket
     * @returns {boolean} if socket has been removed
     */
    removeSocketBySocket: function(socket) {
      for (var key in sockets) {
        if (sockets[key] == socket) {
          sockets[key] = null;
          return true;
        }
      }
      return false;
    },

    /**
     * Removes user from storage by userId.
     * @method removeSocketByUserId
     * @param {integer} userId
     * @returns {boolean} if socket has been removed
     */
    removeSocketByUserId: function(userId) {
      if (sockets[userId]) {
        sockets[userId] = null;
        return true;
      }
      return false;
    },

    /**
     * Sends raw object data to socket of userId if defined. For correct handling on client side
     * eventName is provided.l
     * @param {integer} userId
     * @param {string} eventName
     * @param {object} data
     * @returns {boolean} success send
     */
    sendData: function(userId, eventName, data) {
      if (sockets[userId]) {
        sockets[userId].emit(eventName, data);
        return true;
      }
      return false;
    }
  }
})();