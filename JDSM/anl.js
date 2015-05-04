/**
 * Class Active Node List (ANL). It provides JDSM public API. It automatically handles
 * connection and disconnection of nodes and stores all actual connected nodes.
 *
 * @class ANL
 * @module JDSM
 *
 * @constructor
 * @param {sockets.io object} socketsIO
 * @param {Object} [options] Data to initial set options
 * @param {function(Node)} [options.onRegisterCallback] Callback triggered everytime new node is connected
 * @param {function(Node)} [options.onUnregisterCallback] Callback triggered everytime node is disconnected
 * @param {Integer} [options.nodeTimeout] Time in ms after which node doesn't respond is declared disconnected
 */

var Node = require('./node'),
    _ = require('underscore'),
    Request = require('./request'),
    MasterRequest = require('./masterRequest');

module.exports = function(socketsIO, options) {

  if (!options)
    options = {};

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
   * @property nodes
   * @private
   * @type {Array of Nodes} nodes
   */
  var nodes = [];

  /**
   * Optional register callback
   * @property onRegisterCallback
   * @private
   * @type {function}
   * @default callback from options || null
   */
  var onRegisterCallback = options['onRegisterCallback']  || null;

  /**
   * Optional unregister callback
   * @property onUnregisterCallback
   * @private
   * @type {function}
   * @default callback from options || null
   */
  var onUnregisterCallback = options['onUnregisterCallback'] || null;


  /**
   * All requests which nodes are working on.
   * @property pendingRequests
   * @private
   * @type {Array}
   */
  var pendingRequests = [];

  /**
   * Every request will increment this property -> every request will have unique id
   * @property requestIdFactory
   * @private
   * @type {number}
   */
  var requestIdFactory = 1;

  /**
   * Register node after initialize (socket connect)
   * @method registerNode
   * @private
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
   * @method unregisterNode
   * @private
   * @param {Node} node
   */
  var unregisterNode = function(node) {
    if (onUnregisterCallback) {
      //to unregister callback we pass all pending request which have to be redistributed
      var pendingRequestsForNode = _.filter(nodes, function(request){
        request.node == node;
      });
      onUnregisterCallback(node, pendingRequestsForNode);
    }

    //remove node
    var positionOfNode = nodes.splice(nodes.indexOf(node));
    if (positionOfNode > 0)
      nodes.splice(positionOfNode, 1);

    //unregister node itself
    node.unregisterSelf();
  }

  /**
   * All responses from sockets are going through this function, it finds request and call response
   * method.
   * @method handleResponse
   * @private
   * @param {response object} data
   */
  var handleResponse = function(data) {
    var requestId = data['requestId'];
    var masterRequestId = data['masterRequestId'];
    if (!requestId || !masterRequestId)
      throw new Error('Corrupted response from client, does not contain requestId or masterRequestId');

    var request = _.find(pendingRequests, function(request){
      return request.getId() == requestId;
    });

    if (!request)
      throw new Error('Not found request for response');

    request.handleResponse(data);
    pendingRequests.splice(pendingRequests.indexOf(request),1);
  }

  /**
   * Initialize master request.
   * @method createMasterRequest
   * @private
   * @param type - 'sync' or 'async'
   * @param requests
   * @param callback
   * @returns {MasterRequest}
   */
  var createMasterRequest = function(type, requests, callback) {
    var dependents = [];
    var masterReq = new MasterRequest({
      id: requestIdFactory++,
      type: type,
      callback: callback
    });

    _.each(requests, function(request){
      var r = new Request({
        id: requestIdFactory++,
        node: request['node'] || findBestAvailable(),
        requestData: request['requestData'],
        masterRequest: masterReq
      });
      pendingRequests.push(r);
      dependents.push(r);
    });

    masterReq.setDependentRequests(dependents);
    return masterReq;
  }

  /**
   * Find registered node, if not found null is returned
   * @method find
   * @private
   * @param {number}node
   * @return {node}
   */
  var find = function(nodeId) {
    return _.find(nodes, function(node){
      return node.getId() == nodeId;
    })
  }

  /**
   * Find registered node by specified function called on Node objects
   * @method findBy
   * @private
   * @param {function} compareFunc
   * @return {node}
   */
  var findBy = function(compareFunc) {
    return _.find(nodes, compareFunc);
  }

  /**
   * Find free node based on basic criteria.
   * @method findFree
   * @private
   * @return {node}
   */
  var findFree = function() {
    return _.find(nodes, function(node){
      return node.getIsFree();
    });
  }

  /**
   * Find node with the least traffic, lowest latency and other criteria.
   * @method findBestAvailable
   * @private
   * @return {node}
   */
  var findBestAvailable = function() {
    return _.min(nodes, function(obj){
      return obj.availabilityIndex();
    });
  }

  return {
    /**
     * Send asynchronous requests, callback is called after all requests responded.
     * All requests are independent, callback is called with err and results where
     * results is array of responds for all requests.
     *
     * If object in data array doesn't have property node: with valid Node object,
     * it is provided automaticaly by findBestAvailable.
     * @method sendAsyncRequest
     * @param {Array of objects} requests
     * @param {nodejs standard callback} callback
     */
    sendAsyncRequest: function(requests, callback) {
      var masterReq = createMasterRequest('async', requests, callback);
      masterReq.run();
    },

    /**
     * Send synchrounous requests, callback is called after all requests responded,
     * and they are called sequentially, first is called and respond is append to the next
     * request object into 'prerequisites' property and so forth. Callback is
     * called with err and results where results is respond for last request.
     *
     * If object in data array doesn't have property node: with valid Node object,
     * it is provided automaticaly by findBestAvailable.
     * @method sendSyncRequest
     * @param {array of objects} requests
     * @param callback
     */
    sendSyncRequest: function(requests, callback) {
      var masterReq = createMasterRequest('sync', requests, callback);
      masterReq.run();
    },

    /**
     * Setters for callbacks on connection/disconnection of nodes
     * @method setCallbacks
     * @param {function(node)} registerCallback
     * @param {function(node, pendingRequests)} unregisterCallback
     */
    setCallbacks: function(registerCallback, unregisterCallback) {
      onRegisterCallback = registerCallback;
      onUnregisterCallback = unregisterCallback;
    },

    /**
     * Find registered node, if not found null is returned
     * @method find
     * @param {number}node
     * @return {node}
     */
    find: function(nodeId) {
      return find(nodeId);
    },

    /**
     * Find registered node by specified function called on Node objects
     * @method findBy
     * @param {function} compareFunc
     * @return {node}
     */
    findBy: function(compareFunc) {
      return findBy(compareFunc);
    },

    /**
     * Find free node based on basic criteria.
     * @method findFree
     * @return {node}
     */
    findFree: function() {
      return findFree();
    },

    /**
     * Find node with the least traffic, lowest latency and other criteria.
     * @method findBestAvailable
     * @return {node}
     */
    findBestAvailable: function() {
      return findBestAvailable();
    }
  }
}