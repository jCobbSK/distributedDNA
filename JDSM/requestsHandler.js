/**
 *
 * @class requestsHandler
 * @module JDSM
 */

var _ = require('underscore');
module.exports = function() {

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

  return {

    /**
     *
     * @param data
     * @returns {Object} data with key requestId
     */
    createRequest: function(data) {
      pendingRequests.push(actualId);
      data['requestId'] = actualId;
      return data;
    },

    /**
     *
     * @param data
     */
    handleResponse: function(data) {
      if (!data['requestId']) {
        throw new Error('Response doesn\'t contains requestId');
      }
      var arrayIndexOfRequest = _.indexOf(data['requestId']);
      if (arrayIndexOfRequest < 0) {
        throw new Error('Response doesn\t have valid requestId');
      }
      pendingRequests.splice(arrayIndexOfRequest, 1);
    }
  }
}