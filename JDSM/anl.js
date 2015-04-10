/**
 * Class Active Node List (ANL)
 *
 * @class ANL
 * @module JDSM
 *
 * @param {sockets.io object} socketsIO
 * @param {Object} [options] Data to initial set options
 * @param {function(Node)} [options.onRegisterCallback] Callback triggered everytime new node is connected
 * @param {function(Node)} [options.onUnregisterCallback] Callback triggered everytime node is disconnected
 * @param {Integer} [options.nodeTimeout] Time in ms after which node doesn't respond is declared disconnected
 */

var Node = require('./node');
var _ = require('underscore');

module.exports = function(socketsIO, options) {

  /**
   * @constructor
   */
  (function init(){

    //set up socket.io callbacks
    socketsIO.on('connection', function(socket){
      var node = registerNode(socket);

      node.setOnUnregisterCallback(function(){
        unregisterNode(node);
      });

      //so we can handle disconnect
      socket.on('disconnect', function(){
        unregisterNode(node);
      });

      socket.on('results', function(results){
        handleResponse(results);
      });
    });

  })();

  /**
   * List of active connected nodes
   *
   * @type {Array of Nodes} nodes
   */
  var nodes = [];

  /**
   * Optional register callback
   * @type {function}
   * @default callback from options || null
   */
  var onRegisterCallback = options['onRegisterCallback']  || null;

  /**
   * Optional unregister callback
   * @type {function}
   * @default callback from options || null
   */
  var onUnregisterCallback = options['onUnregisterCallback'] || null;


  /**
   * All requests which nodes are working on.
   * @property pendingRequests
   * @type {Array}
   */
  var pendingRequests = [];

  /**
   * Every request will increment this property -> every request will have unique id
   * @property actualId
   * @type {number}
   */
  var actualId = 0;

  /**
   * Register node after initialize (socket connect)
   * @param {Socket} socket
   * @return {Node} newNode
   */
  var registerNode = function(socket) {
    var newNode = Node(socket);

    nodes.push(newNode);

    if (onRegisterCallback)
      onRegisterCallback(newNode);

    return newNode;
  }

  /**
   * Unregister node.
   * @param {Node} node
   */
  var unregisterNode = function(node) {
    if (onUnregisterCallback)
      onUnregisterCallback(node);

    //remove node
    var positionOfNode = nodes.splice(nodes.indexOf(node));
    if (positionOfNode > 0)
      nodes.splice(positionOfNode, 1);
  }

  /**
   *
   * @param {response object} data
   */
  var handleResponse = function(data) {

  }

  return {
    /**
     * Find registered node, if not found null is returned
     * @param {number}node
     * @return {node}
     */
    find: function(nodeId) {
      return _.find(nodes, function(node){
        return node.getId() == nodeId;
      })
    },

    /**
     * Find registered node by specified function called on Node objects
     * @param {function} compareFunc
     * @return {node}
     */
    findBy: function(compareFunc) {
      return _.find(nodes, compareFunc);
    },

    /**
     * Find free node based on basic criteria.
     * @return {node}
     */
    findFree: function() {
      return _.find(nodes, function(node){
        return node.getIsFree();
      });
    },

    /**
     * Find node with the least traffic, lowest latency and other criteria.
     * @return {node}
     */
    findBestAvailable: function() {

    },

    /**
     * Send asynchronous requests, callback is called after all requests responded.
     * All requests are independent, callback is called with err and results where
     * results is array of responds for all requests.
     *
     * If object in data array doesn't have property node: with valid Node object,
     * it is provided automaticaly by findBestAvailable.
     * @param {Array of objects} requests
     * @param {nodejs standard callback} callback
     */
    sendAsyncRequest: function(requests, callback) {

    },

    /**
     * Send synchrounous requests, callback is called after all requests responded,
     * and they are called sequentially, first is called and respond is append to the next
     * request object into 'prerequisites' property and so forth. Callback is
     * called with err and results where results is respond for last request.
     *
     * If object in data array doesn't have property node: with valid Node object,
     * it is provided automaticaly by findBestAvailable.
     * @param {array of objects} requests
     * @param callback
     */
    sendSyncRequest: function(requests, callback) {

    },

    /**
     * Setters for callbacks on connection/disconnection of nodes
     * @param {function(node)} registerCallback
     * @param {function(node)} unregisterCallback
     */
    setCallbacks: function(registerCallback, unregisterCallback) {
      onRegisterCallback = registerCallback;
      onUnregisterCallback = unregisterCallback;
    }
  }
}