var JDSM = require('../JDSM/client')('http://localhost:3000'),
    _ = require('underscore'),
    sizeof = require('object-sizeof');
module.exports = (function() {
  /**
   * Cached clusters on client side.
   * @property clusters
   * @private
   * @type {Object with clusterId-s as keys}
   */
  var clusters = [];

  /**
   * Self-instantiate object for handling data trafic, so it is possible to measure
   * network activity of node.
   * @class DataTraffic
   */
  var DataTraffic = (function(){

    /**
     * Amount of downloaded data for processing. In Bytes.
     * @private
     * @property downloadedData
     * @type {integer}
     */
    var downloadedData = 0;

    /**
     * Amount of uploaded data of results. In Bytes.
     * @private
     * @property uploadedData
     * @type {integer}
     */
    var uploadedData = 0;

    /**
     * Method called everytime data is changed. Used for updating DOM with actual data.
     * @method changeCallback
     * @private
     */
    var changeCallback = function() {
      //TODO update DOM with accurate data
      console.log('Downloaded: ',downloadedData, ' Uploaded: ',uploadedData);
    }

    return {

      /**
       * Add download data in B.
       * @method addDownload
       * @param {integer}lengthInB
       */
      addDownload: function(lengthInB) {
        downloadedData += lengthInB;
        changeCallback();
      },

      /**
       * Add upload data in B.
       * @method addUpload
       * @param lengthInB
       */
      addUpload: function(lengthInB) {
        uploadedData += lengthInB;
        changeCallback();
      }
    }
  })();

  /**
   * Actual regExp testing of pattern with sequence.
   * @method analyze
   * @private
   * @param {string} sequence
   * @param {integer} startSequence
   * @param {PatternObject} pattern
   * @returns {Object{patternId:*,result:*}}
   */
  var analyze = function(sequence, startSequence, pattern) {
    var regExp = RegExp(pattern.sequence);
    var subSequence = sequence.substring(pattern.sequenceStart - startSequence, pattern.sequenceEnd - startSequence);
    return {
      patternId: pattern.id,
      result:regExp.test(subSequence)
    };
  }

  /**
   * Analyze all patterns inside cluster specified by clusterId, returns array of result objects
   * from analyze method.
   * @method analyzeCluster
   * @private
   * @param {string} sequence
   * @param {integer} clusterId
   * @returns {Array of Object{patternId:*,result:*}}
   */
  var analyzeCluster = function(sequence, clusterId) {
    var cluster = clusters[data.clusterId];
    var results = [];
    _.each(cluster.patterns, function(pattern){
      results.push(
        analyze(sequence, cluster.clusterSequenceStart,pattern)
      )
    })

    return results;
  }

  /**
   * Register all tasks for Node to handle
   * @constructor
   */
  (function init(){
    JDSM.registerTask('analyze', function(data, respond){
      DataTraffic.addDownload(sizeof(data));
      var resultObject = {
        sampleId: data.sampleId,
        results: analyzeCluster(data.sampleSequence, data.clusterId)
      };
      DataTraffic.addUpload(sizeof(resultObject));
      respond(resultObject);
    })

    JDSM.registerTask('analyzeNoCache', function(data, respond){
      DataTraffic.addDownload(sizeof(data));
      var sequence = data.sampleSequence;
      var results = [];
      _.each(data.patterns, function(patternObject){
        results.push(analyze(sequence, data.sampleSequenceStart, patternObject));
      });

      var resObject = {
        sampleId: data.sampleId,
        results: results
      };
      DataTraffic.addUpload(sizeof(resObject));
      respond(resObject);
    })

    JDSM.registerTask('addClusters', function(data, respond){
      DataTraffic.addDownload(sizeof(data));
      _.each(data, function(clusterObject){
        clusters[clusterObject.clusterId] = clusterObject;
      });
      respond('200');
    })

    JDSM.registerTask('freeClusters', function(data, respond){
      DataTraffic.addDownload(sizeof(data));
      _.each(data, function(clusterId){
        clusters[clusterId] = null;
      });
      respond('200');
    })
  })()

})()
