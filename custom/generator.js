/**
 * Static class with methods of creating fixture data.
 * @class Generator
 * @module Custom
 */
var Models = require('../models'),
    q = require('q');
module.exports = (function() {

  /**
   * Object with static settings for class.
   * @property settings
   * @type {Object}
   */
  var settings = {
    patientName: 'Generator',
    additionalInfo: 'Generated Sample for patterns: '
  }

  return {
    /**
     * Creates sample record for user defined by username and positive for all patterns in
     * patternIds array.
     * @method createSample
     * @param {string} username
     * @param {Integer[]} patternIds
     * @param {function(Sample)} callback
     */
    createSample: function(username, patternIds, callback) {

    }
  }
})();