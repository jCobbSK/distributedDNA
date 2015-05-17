/**
 * Client class executed on node's front-end. This class has to be browserifyied and include
 * into compute page. It automatically injects JDSM module's client class and therefore sockets.io-client
 * script too.
 * @class Client
 * @module DNAAnalysis
 */
var JDSM = require('../JDSM/client')('http://localhost:3000'),
    _ = require('underscore'),
    sizeof = require('object-sizeof'),
    $ = require('jquery'),
    moment = require('moment');
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
     * Check if node is actually computing data.
     * @private
     * @property isWorking
     * @type {boolean}
     */
    var isWorking = false;

    /**
     * Format number of bytes into string with proper prefix kB, MB, GB
     * @method formatBytes
     * @private
     * @param {integer} bytes
     * @returns {string}
     */
    var formatBytes = function(bytes) {
      if (bytes < 1000)
        return bytes + 'B';
      else if (bytes < 1000000)
        return Math.floor(bytes / 1000)+'kB';
      else
        return Math.floor(bytes / 1000000)+'MB';
    }

    /**
     * Method called everytime data is changed. Used for updating DOM with actual data.
     * @method changeCallback
     * @private
     */
    var changeCallback = function() {
      console.log('Downloaded: ',downloadedData, ' Uploaded: ',uploadedData);
      $('#downloaded-data').html(formatBytes(downloadedData));
      $('#uploaded-data').html(formatBytes(uploadedData));
    }

    /**
     * Method called everytime isWorking state is changed. Used for updating DOM.
     * @method workingChangeCallback
     * @private
     */
    var workingChangeCallback = function() {
      $ ('#status-text').html(
        isWorking ? 'Computing' : 'Idle'
      );
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
      },

      /**
       * Change isWorking status, if newVal is provided it is automatically set, otherwise
       * the current value is switched.
       * @method switchIsWorking
       * @param {bool} newVal
       */
      switchIsWorking: function(newVal) {
        var val = newVal || !isWorking;
        isWorking = val;
        workingChangeCallback();
      }
    }
  })();

  /**
   * Actual regExp testing of pattern with sequence. Javascript maximum RegExp varying between browsers
   * but patterns might exceed this limit so we need to split long regular expression into smaller.
   * @method analyze
   * @private
   * @param {string} sequence
   * @param {integer} startSequence
   * @param {PatternObject} pattern
   * @returns {Object{patternId:*,result:*}}
   */
  var analyze = function(sequence, startSequence, pattern) {
    var regExp = pattern.sequence;
    var subSequence = sequence.substring(pattern.sequenceStart - startSequence, pattern.sequenceEnd - startSequence + 1);
    return {
      patternId: pattern.id,
      result: regExp === subSequence
    };
  };

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
    var cluster = clusters[clusterId];
    var results = [];
    _.each(cluster.patterns, function(pattern){
      results.push(
        analyze(sequence, cluster.clusterSequenceStart,pattern)
      )
    })

    return results;
  };

  /**
   * Register all tasks for Node to handle
   * @constructor
   */
  (function init(){
    JDSM.registerTask('analyze', function(data, respond){
      console.log('analyze',data);

      DataTraffic.switchIsWorking(true);
      DataTraffic.addDownload(sizeof(data));

      var resultObject = {
        sampleId: data.sampleId,
        results: analyzeCluster(data.sampleSequence, data.clusterId)
      };

      respond.respond(resultObject);

      DataTraffic.addUpload(sizeof(resultObject));
      DataTraffic.switchIsWorking(false);
    });

    JDSM.registerTask('analyzeNoCache', function(data, respond){
      console.log('analyzeNoCache',data);

      DataTraffic.switchIsWorking(true);
      DataTraffic.addDownload(sizeof(data));

      var sequence = data.sampleSequence || '';
      var results = [];
      _.each(data.patterns, function(patternObject){
        results.push(analyze(sequence, data.sampleSequenceStart, patternObject));
      });

      var resObject = {
        sampleId: data.sampleId,
        results: results
      };

      respond.respond(resObject);

      DataTraffic.addUpload(sizeof(resObject));
      DataTraffic.switchIsWorking(false);
    });

    JDSM.registerTask('addClusters', function(data, respond){
      console.log('addClusters',data);
      DataTraffic.addDownload(sizeof(data));
      _.each(data, function(clusterObject){
        clusters[clusterObject.clusterId] = clusterObject;
      });
      respond.respond('200');
    });

    JDSM.registerTask('freeClusters', function(data, respond){
      console.log('freeClusters',data);
      DataTraffic.addDownload(sizeof(data));
      _.each(data, function(clusterId){
        clusters[clusterId] = null;
      });
      respond.respond('200');
    });

    //set timer to update time of calculation every minute
    var startedTime = moment();
    setInterval(function(){
     var diff = moment().diff(startedTime);
      var result = moment.utc(diff).format('HH:mm:ss');
     $('#duration').html(result);
    },1000);
  })();

})();
