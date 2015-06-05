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
   * Object property where key represents userId-s and value represents if user should update page.
   * @property users
   * @private
   * @type {Object of Arrays}
   */
  var users = {};

  return {
    /**
     * Register user for new results. If already exists, pending results are removed.
     * @method connectUser
     * @param {integer} userId
     * @param {integer} sampleId
     * @returns {void}
     */
    connectUser: function(userId) {
      users[userId] = false;
    },

    /**
     * Check if some result has been added to user and therefore he need to refresh page.
     * @method needRefresh
     * @param {integer} userId
     * @returns {Result[]}
     */
    needRefresh: function(userId) {
      var res = users[userId];
      users[userId] = false;
      return res;
    },

    /**
     * Set that user should reload his browser.
     * @method addResult
     * @param {integer} userId
     * @param {Result} result
     * @returns {void}
     */
    addResult: function(userId) {
      users[userId] = true;
    }
  }
})();