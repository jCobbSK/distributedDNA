/**
 * Basic Node class, representing one connected user to system.
 *
 * @class Node
 * @module JDSM
 *
 * @param {socket.IO socket object} socket
 * @param {Object} [options] init options object
 * @param {function} [options.onUnregisterCallback] Callback triggered after node is declared disconnected
 * @param {integer} [options.timeout] Timeout in ms after which node doesn't respond is declared disconnected
 */
module.exports = function(_socket, options) {

  if (!options)
    options = {};

  /**
   * Start cyclic interval which measure latency of node.
   * @method runLatencyUpdater
   * @private
   */
  var runLatencyUpdater = function() {
    setInterval(function(){
      if (pendingPing) {
        //we havent got response for ping as long as timeout is set -> we are assuming node is
        //disconnected
        if (onUnregisterCallback)
          onUnregisterCallback();
      }
      var startTime = Date.now();
      socket.emit('ping');
      pendingPing = true;
      socket.on('ping', function(){
        var latency = Date.now() - startTime;
        averagePing = (averagePing + latency) / 2;
        pendingPing = false;
      })
    }, timeout);
  };

  /**
   * Default socket object, use for communication and identification of node.
   * Initialize in constructor.
   * @property socket
   * @private
   * @type {socket.IO socket object}
   */
  var socket = null;

  /**
   * Unique identifier.
   * @property id
   * @private
   * @type {number}
   */
  var id = 1;

  /**
   * Is some pending request for this node.
   * @property isFree
   * @private
   * @type {boolean}
   * @default false
   */
  var isFree = false;

  /**
   * Average latency of node computed during all requests on node so far.
   * @property averagePing
   * @private
   * @type {number}
   */
  var averagePing = 0;

  /**
   * Ratio of time with node with pending request (working) and all time
   * connected.
   * @property averageUse
   * @private
   * @type {float number}
   */
  var averageUse = 0.0;

  /**
   * Set on init, that is time when Node is created.
   * @property connectedAt
   * @private
   * @type {date}
   * @default actual timestamp
   */
  var connectedAt = Date.now();

  /**
   * Timeout in ms after which node doesn't respond is declared disconnected
   * @property timeout
   * @private
   * @type {number}
   */
  var timeout = options['timeout'] || 10000;

  /**
   * Are we still waiting for ping response from client.
   * @property pendingPing
   * @private
   * @type {boolean}
   */
  var pendingPing = false;

  /**
   * If client crashes without socket emit disconnected we find out by pinging, and need to
   * act on it.
   * @property onUnregisterCallback
   * @private
   * @type {function}
   */
  var onUnregisterCallback = options['onUnregisterCallback'] || null;

  /**
   * @constructor
   */
  (function init(){
    socket = _socket;
    runLatencyUpdater();
  })();

  return {
    /**
     * Determine latency and transaction speed of node to server.
     * @method ping
     * @return {Object} latency (ms) and bandwidth (kB/s)
     */
    ping: function() {

    },

    /**
     * Actual communication with node.
     * @method sendReq
     * @param {string} eventName
     * @param {string/JSON stringifyable object} data
     */
    sendReq: function(eventName, data) {
      socket.emit(eventName, data);
    },

    /**
     * Set timeout after which client doesn't respond on ping request, we declare it disconnected.
     * @method setTimeout
     * @param {integer} timeInSec
     */
    setTimeout: function(timeInSec) {
      timeout = timeInSec;
    },

    /**
     * When client disconnects, we need to call it.
     * @method setOnUnregisterCallback
     * @param {function} _callback
     */
    setOnUnregisterCallback: function(_callback) {
      onUnregisterCallback = _callback;
    },

    /**
     * Getter
     * @method getIsFree
     * @returns {boolean}
     */
    getIsFree: function() {
      return isFree;
    },

    /**
     * Setter
     * @method setIsFree
     * @param {boolean} _isFree
     */
    setIsFree: function(_isFree) {
      isFree = _isFree;
    },

    /**
     * getter
     * @method getId
     * @returns {number}
     */
    getId: function() {
      return id;
    }
  }
}