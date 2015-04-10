/**
 * Request object used for handling async and sync requests.
 * @param options
 * @module JDSM
 */
module.exports = function(options) {
  //if options doesn't contains required params throw err
  if (!options['id'] || !options['node'])
    throw new Error('Request can\'t be created without id and Node');


  /**
   * Self referencing property
   * @type {Request class}
   */
  var self = this;

  /**
   * Unique id of request
   * @type {number}
   * @required
   */
  var id = options['id'];

  /**
   * Node -> representing user
   * @type {JDSM.node}
   * @required
   */
  var node = options['node'];

  /**
   * Master request object.
   * @type {JDSM.Request}
   */
  var masterRequest = options['masterRequest'] || null;

  /**
   * Response for the request from client node.
   * @type {Object}
   */
  var response = null;

  /**
   * Object consists of 'eventName' and 'data'
   * @type {Object} json stringifyable object so it can be send to node
   */
  var requestData = options['requestData'] || {};

  return {

    /**
     * Low level handling.
     * @param {Object} _response Data object directly from client socket.
     */
    handleResponse: function(_response) {
      if (!masterRequest)
        throw Error('Can\'t handle response of request without mainRequest');
      response = _response;
      node.setIsFree(true);
      masterRequest.handleResponse(self);
    },

    /**
     * Send request to node for calculating.
     * @param {Object} _requestData - object send to node (override Object provided to constructor),
     *                                required attributes are eventName and data
     * @param {Object} prerequisites - object append to attribute 'prerequisites' of requestData
     */
    run: function(_requestData, prerequisites) {
      if (!node)
        throw new Error('Not defined node in request');

      node.setIsFree(false);
      requestData = _requestData || requestData;

      if (prerequisites)
        requestData['data']['prerequisites'] = prerequisites;

      requestData['requestId'] = id;
      requestData['masterRequestId'] = masterRequest.getId();
      node.sendReq(requestData['eventName'], requestData['data']);
    },

    getId: function() {
      return id;
    },

    getResponse: function() {
      return response;
    }
  }
}