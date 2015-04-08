/**
 * Class Active Node List (ANL)
 *
 * @class ANL
 * @module JDSM
 *
 * @param {sockets.io object} socketsIO
 */
var Node = require('./node');
module.exports = function(socketsIO) {

  /**
   * @constructor
   */
  (function init(){

    //set up socket.io callbacks
    socketsIO.on('connection', function(socket){
      var node = registerNode(socket);

      //so we can handle disconnect
      socket.on('disconnect', function(){
        unregisterNode(node);
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
   */
  var onRegister = null;

  /**
   * Optional unregister callback
   * @type {function}
   */
  var onUnregister = null;

  /**
   * All requests which nodes are working on.
   * @property pendingRequests
   * @type {Array}
   */
  var pendingRequests = [];

  /**
   * Register node after initialize (socket connect)
   * @param {Socket} socket
   * @return {Node} newNode
   */
  var registerNode = function(socket) {
    var newNode = Node(socket);

    nodes.push(newNode);

    if (onRegister)
      onRegister(newNode);

    return newNode;
  }

  /**
   * Unregister node.
   * @param {Node} node
   */
  var unregisterNode = function(node) {
    if (onUnregister)
      onUnregister(node);

    //remove node
    var positionOfNode = nodes.splice(nodes.indexOf(node));
    if (positionOfNode > 0)
      nodes.splice(positionOfNode, 1);
  }

  /**
   * When any respond for request comes from node, this function handle it.
   * @param data
   */
  var respondFromNode = function(data) {

  }

  return {
    /**
     * Find registered node, if not found null is returned
     * @param {number}node
     * @return {node}
     */
    find: function(nodeId) {

    },

    /**
     * Find registered node by specified function called on Node objects
     * @param {function} compareFunc
     * @return {node}
     */
    findBy: function(compareFunc) {

    },

    /**
     * Find free node based on basic criteria.
     * @return {node}
     */
    findFree: function() {

    },

    /**
     * Find node with the least traffic, lowest latency and other criteria.
     * @return {node}
     */
    findBestAvailable: function() {

    },

    /**
     * Send asynchronous requests, callback is called after all requests responded.
     * All requests are independent, that is why they are called asynchronous.
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
     * and they are called sequentially, first is called and respond is append to next
     * request object into 'prerequisites' property and so forth.
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
      onRegister = registerCallback;
      onUnregister = unregisterCallback;
    }
  }
}