/**
 * Basic Node class, representing one connected user to system.
 *
 * @class Node
 * @module JDSM
 *
 * @constructor
 * @param {socket.IO socket object} socket
 * @param {Object} [options] init options object
 * @param {function} [options.onUnregisterCallback] Callback triggered after node is declared disconnected
 * @param {integer} [options.timeout] Timeout in ms after which node doesn't respond is declared disconnected
 */
var randomstring = require('randomstring');
module.exports = function(_socket, options) {

  if (!options)
    options = {};

  /**
   * Start cyclic interval which measure latency of node.
   * @method runLatencyUpdater
   * @private
   */
  var runLatencyUpdater = function() {
    latencyUpdaterInterval = setInterval(function(){
      if (pendingPing) {
        //we havent got response for ping as long as timeout is set -> we are assuming node is
        //disconnected
        if (onUnregisterCallback)
          onUnregisterCallback();
      }

      socket.emit('ping', Date.now());
      pendingPing = true;
      socket.on('ping', function(data){
        var latency = Date.now() - data;
        PingHandler.addLatency(latency);
        console.log('Latency: ',PingHandler.getAverageLatency(),'ms');
        pendingPing = false;
      })
    }, timeout);
  };

  /**
   * Latency updater interval ID for clearing after node disconnection.
   * @property latencyUpdaterInterval
   * @private
   * @type {integer}
   */
  var latencyUpdaterInterval = null;

  /**
   * Calculate bandwidth and performance of node. It send 1MB of random string, node after receive
   * mark timestamp, perform benchmark calculations on it, mark timestamp and send everything back.
   * @method bandwidthAndPerformanceUpdater
   * @private
   */
  var bandwidthAndPerformanceUpdater = function() {
    //generate data
    var data = {
      randomString: randomstring.generate(50000),
      sendTimestamp: Date.now()
    };
    socket.emit('benchmark', data);
    socket.on('benchmark', function(data){
      var downloadTime = data['receivedTimestamp'] - data['sendTimestamp'];
      var uploadTime = Date.now() - data['sendTimestamp'];
      var calculationTime = data['calculationsDoneTimestamp'] - data['receivedTimestamp'];
      bandwidth = (downloadTime + uploadTime) / 2;
      performance = calculationTime;
    });
  }

  /**
   * Connection bandwidth calculated and set by bandwidthAndPerformanceUpdater
   * @property bandwidth
   * @type {Float}
   * @private
   */
  var bandwidth = 0;

  /**
   * Performance index calculated and set by bandwidthAndPerformanceUpdater. Higher means longer
   * calculation time -> higher is worse.
   * @property performance
   * @type {Integer}
   * @private
   */
  var performance = 0;

  /**
   * Default socket object, use for communication and identification of node.
   * Initialize in constructor.
   * @property socket
   * @private
   * @type {socket.IO socket object}
   * @required
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
   * Self-Invoked Class for handling ping measurements. Get actual average ping with getAveragePing() method.
   * @class PingHandler
   * @for PingHandler
   */
  var PingHandler = (function() {
    var sumOfLatencies = 0;
    var numberOfMeasurements = 0;
    return {
      /**
       * Get average latency based on all available ping requests.
       * @method getAverageLatency
       * @returns {integer}
       */
      getAverageLatency: function() {
        return Math.ceil(sumOfLatencies / numberOfMeasurements);
      },
      /**
       * Add latency from request.
       * @method addLatency
       * @param {Integer} latency
       */
      addLatency: function(latency) {
        sumOfLatencies += latency;
        numberOfMeasurements++;
      }
    }
  })();

  /**
   * Number of requests called since connected. Used in getAverageUse method
   * @property numberOfRequests
   * @type {Integer}
   */
  var numberOfRequests = 0;

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
    bandwidthAndPerformanceUpdater();
  })();

  return {
    /**
     * Get average latency of node.
     * @method getPing
     * @return {Integer} latency in (ms)
     */
    getPing: function() {
      return PingHandler.getAverageLatency();
    },

    /**
     * Average number of requests per minute.
     * @method getAverageUse
     * @return {integer}
     */
    getAverageUse: function() {
      return Math.ceil(numberOfRequests / ((Date.now() - connectedAt)/60000));
    },

    /**
     * Index which indicates likeliness to choose this node for request.
     * It considers latency and usage of node.
     * @method availabilityIndex
     * @return {float}
     */
    availabilityIndex: function() {
      return (this.getPing()/10)*this.getAverageUse();
    },

    /**
     * Actual communication with node.
     * @method sendReq
     * @param {string} eventName
     * @param {string/JSON stringifyable object} data
     */
    sendReq: function(eventName, data) {
      numberOfRequests++;
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
    },

    /**
     * Call for unregistering self. Mainly cancel our inside loops.
     * @method unregisterSelf
     */
    unregisterSelf: function() {
      clearInterval(latencyUpdaterInterval);
    }
  }
}