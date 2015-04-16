/**
 * Low level request object.
 * @class Request
 * @param options
 * @module JDSM
 */
module.exports = function(options) {
  //if options doesn't contains required params throw err
  if (!options['id'] || !options['node'])
    throw new Error('Request can\'t be created without id and Node');


  /**
   * Self referencing property
   * @property self
   * @private
   * @type {Request class}
   */
  var self = this;

  /**
   * Unique id of request
   * @property id
   * @private
   * @type {number}
   * @required
   */
  var id = options['id'];

  /**
   * Node -> representing user
   * @property node
   * @private
   * @type {JDSM.node}
   * @required
   */
  var node = options['node'];

  /**
   * Master request object.
   * @property masterRequest
   * @private
   * @type {JDSM.Request}
   */
  var masterRequest = options['masterRequest'] || null;

  /**
   * Response for the request from client node.
   * @property response
   * @private
   * @type {Object}
   */
  var response = null;

  /**
   * Object consists of 'eventName' and 'data'
   * @property requestData
   * @private
   * @type {Object} json stringifyable object so it can be send to node
   */
  var requestData = options['requestData'] || {};

  return {

    /**
     * Low level handling.
     * @method handleResponse
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
     * @method run
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

    /**
     * Basic getter
     * @method getId
     * @returns {number}
     */
    getId: function() {
      return id;
    },

    /**
     * Basic getter
     * @method getResponse
     * @returns {Object}
     */
    getResponse: function() {
      return response;
    }
  }
}