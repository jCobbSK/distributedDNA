/**
 * Basic Node class, representing one connected user to system.
 *
 * @class Node
 * @module JDSM
 *
 * @param {socket.IO socket object} socket
 * @param {function} onUnregisterCallback -- because Node itself will check it's conne
 */
module.exports = function(_socket) {

  /**
   * @constructor
   */
  (function init(){
    socket = _socket;
  })();

  /**
   * Default socket object, use for communication and identification of node.
   * Initialize in constructor.
   *
   * @type {socket.IO socket object}
   */
  var socket = null;

  /**
   * Unique identifier.
   * @property id
   * @type {number}
   */
  var id = 1;

  /**
   * Is some pending request for this node.
   *
   * @property isFree
   * @type {boolean}
   * @default false
   */
  var isFree = false;

  /**
   * Average latency of node computed during all requests on node so far.
   *
   * @property averagePing
   * @type {number}
   */
  var averagePing = 0;

  /**
   * Ratio of time with node with pending request (working) and all time
   * connected.
   *
   * @type {float number}
   */
  var averageUse = 0.0;

  return {
    /**
     * Determine latency and transaction speed of node to server.
     * @return {Object} latency (ms) and bandwidth (kB/s)
     */
    ping: function() {

    },

    /**
     * Actual communication with node.
     *
     * @param {string/JSON stringifyable object} data
     * @param {string} msgId
     * @param {nodejs standardized callback} callback
     */
    sendReq: function(data, msgId, callback) {

    }
  }
}