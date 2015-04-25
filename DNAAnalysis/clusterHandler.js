/**
 * Handler for clusters. Manages creation of clusters.
 * @class ClusterHandler
 * @constructor
 * @param {Object} [options] Hash with options into constructor
 * @param {Integer} [options.idealSequenceLength] Ideal sequence length of cluster. (default = infinite)
 *
 * @module DNAAnalysis
 */
var _ = require('underscore'),
    Cluster = require('./cluster');
module.exports = function(options) {
  if (!options)
    options = {};

  /**
   * Ideal sequence length of cluster.
   * @property idealSequenceLength
   * @type {integer}
   * @default -1 (infinite)
   */
  var idealSequenceLength = options['idealSequenceLength'] || -1;

  /**
   * Array of 23 arrays of clusters. One array for each chromosome.
   * @property clusters
   * @type {Array of Array of Cluster}
   * @private
   */
  var clusters = (function(){
    var result = [];
    for (var i= 0,len=23;i<len;i++){
      result.push([]);
    }
    return result;
  })();

  /**
   * Increment after every creation of cluster -> unique id
   * @property clusterIndexFactory
   * @private
   * @type {number}
   */
  var clusterIndexFactory = 1;

  /**
   * Complex object for tracking information which clusters have been send to calculation for particular sample.
   * It is created and manipulated by getClusterForSample and finishSample methods.
   * @property samplesProgress
   * @private
   * @type {Object}
   */
  var samplesProgress = {};

  /**
   * Find clusters which collide with pattern.
   * @method findCollideClustersWithPattern
   * @private
   * @param {Pattern} pattern
   * @return {Array of Cluster}
   */
  var findCollideClustersWithPattern = function(pattern) {
    var patternStart = pattern.sequenceStart;
    var patternEnd = pattern.sequenceEnd;
    var result = [];
    _.each(clusters[pattern.chromosome-1], function(cluster){
      //collide on right side of cluster
      if (patternStart > cluster.getSequenceStart() && patternStart < cluster.getSequenceEnd())
        result.push(cluster);

      //collide on left side of cluster
      else if (patternEnd > cluster.getSequenceStart() && patternEnd < cluster.getSequenceEnd())
        result.push(cluster);

      //cluster is inside pattern
      else if (patternStart < cluster.getSequenceStart() && patternEnd > cluster.getSequenceEnd())
        result.push(cluster);

      //pattern is inside cluster
      else if (patternStart > cluster.getSequenceStart() && patternEnd < cluster.getSequenceEnd())
        result.push(cluster);
    });
    return result;
  }

  /**
   * Merge 2 clusters into new one.
   * @method mergeClusters
   * @param {cluster} cluster1
   * @param {cluster} cluster2
   * @returns {Cluster}
   */
  var mergeClusters = function(cluster1, cluster2) {
    var result = new Cluster({
      id: clusterIndexFactory++,
      chromosome: cluster1.getChromosome()
    });

    _.each(cluster1.getPatterns(), function(pattern){
      result.addPattern(pattern);
    });

    _.each(cluster2.getPatterns(), function(pattern){
      result.addPattern(pattern);
    });
    return result;
  }

  return {
    /**
     * Add one pattern. It either add new cluster or extend existing one.
     * @method addPattern
     * @param {Pattern} pattern
     */
    addPattern: function(pattern) {
      var collidingClusters = findCollideClustersWithPattern(pattern);
      //no colliding cluster -> pattern is standalone -> create new cluster
      if (collidingClusters.length == 0) {
        //create cluster
        var c = new Cluster({
          id:clusterIndexFactory++,
          chromosome: pattern.chromosome
        });
        c.addPattern(pattern);
        clusters[pattern.chromosome-1].push(c);
        return;
      }

      if (collidingClusters.length == 1) {
        //if cluster is inside pattern put pattern into cluster
        if (pattern.sequenceStart < collidingClusters[0].getSequenceStart() &&
            pattern.sequenceEnd > collidingClusters[0].getSequenceEnd()) {
          collidingClusters[0].addPattern(pattern);
          return;
        }
        //if pattern is inside cluster put pattern into cluster
        if (pattern.sequenceStart > collidingClusters[0].getSequenceStart() &&
            pattern.sequenceEnd < collidingClusters[0].getSequenceEnd()){
          collidingClusters[0].addPattern(pattern);
          return;
        }

        //if extended cluster is closer to goal length put pattern inside, otherwise create new cluster
        var sequenceLengthAfterAdd = collidingClusters[0].simulateAddPattern(pattern)['sequenceLength'];
        if (Math.abs(sequenceLengthAfterAdd - idealSequenceLength) < Math.abs(collidingClusters[0].getSequenceLength() - idealSequenceLength)) {
          //add pattern inside cluster
          collidingClusters[0].addPattern(pattern);
          return;
        } else {
          //create cluster
          var c = new Cluster({
            id:clusterIndexFactory++,
            chromosome: pattern.chromosome
          });
          c.addPattern(pattern);
          clusters[pattern.chromosome-1].push(c);
          return;
        }

      }

      //colliding clusters > 1 -> need to select best one to add pattern
      var addToIndex = 0;
      var diffToIdeal = Math.abs(collidingClusters[0].simulateAddPattern(pattern)['sequenceLength'] - idealSequenceLength);
      for (var i= 1, len=collidingClusters.length; i<len;i++){
        var _diff = Math.abs(collidingClusters[i].simulateAddPattern(pattern)['sequenceLength'] - idealSequenceLength);
        if (_diff < diffToIdeal) {
          addToIndex = i;
          diffToIdeal = _diff;
        }
      }

      collidingClusters[addToIndex].addPattern(pattern);
    },

    /**
     * Calls addPattern on multiple patterns.
     * @method addPatterns
     * @param {Array of Pattern} patterns
     */
    addPatterns: function(patterns) {
      var self = this;
      _.each(patterns, function(element, index, list){
        self.addPattern(element);
      });
    },

    /**
     * Merge neighbour clusters to eliminate small
     * @method finalizeClustering
     * @private
     */
    finalizeClustering: function() {

      for (var chromosomeIndex = 0, len = clusters.length; chromosomeIndex < len; chromosomeIndex++) {
        //sort clusters
        clusters[chromosomeIndex].sort(function(c1, c2){
          return c1.getSequenceStart() - c2.getSequenceStart();
        });

        var newArray = [];
        //check for merge
        var clustersArray = clusters[chromosomeIndex];
        if (clustersArray.length > 1) {
          for (var i = 1, ilen = clustersArray.length; i < ilen; i++) {
            //if neighbour clusters collide and merged are smaller than idealSequenceLength -> merge them
            if (clustersArray[i].getSequenceStart() < clustersArray[i-1].getSequenceEnd() &&
                clustersArray[i].getSequenceEnd() - clustersArray[i-1].getSequenceStart() < idealSequenceLength) {
              var mergedCluster = mergeClusters(clustersArray[i-1], clustersArray[i]);
              clustersArray[i] = mergedCluster;
              newArray.push(mergedCluster);
            } else {
              if (i==1)
                newArray.push(clustersArray[0]);
              newArray.push(clustersArray[i]);
            }
          }
          clusters[chromosomeIndex] = newArray;
        }

      }
    },

    /**
     * Returns first not already provided cluster for particular sample defined by unique sampleId.
     * @method getClusterForSample
     * @param {integer} chromosome
     * @param {integer} sampleId
     * @param {integer} sequenceStart
     * @param {integer} sequenceEnd
     * @returns {Array of DNAAnalysis.Cluster}
     */
    getClustersForSample: function(sampleId, chromosome, sequenceStart, sequenceEnd) {

      if (!samplesProgress[sampleId]) {
        samplesProgress[sampleId] = {};
      }

      if (!samplesProgress[sampleId][chromosome]) {
        samplesProgress[sampleId][chromosome] = [];
      }

      var result = _.filter(clusters[chromosome], function(cluster, index){
        if (cluster.getSequenceStart() >= sequenceStart && cluster.getSequenceEnd() <= sequenceEnd &&
            samplesProgress[sampleId][chromosome].indexOf(index) == -1) {
          samplesProgress[sampleId][chromosome].push(index);
          return true;
        }
        return false;
      });

      return result;
    },

    /**
     * Removes object with progress for particular sample in addition returns clusters which may have
     * partially patterns inside sequence => not all cluster is inside sequence.
     * @method finishAnalyzingSample
     * @param {integer} sampleId
     * @param {integer} chromosome
     * @param {integer} sequenceStart
     * @param {integer} sequenceEnd
     * @returns {Array of DNAAnalysis.Cluster}
     */
    finishAnalyzingSample: function(sampleId, chromosome, sequenceStart, sequenceEnd) {
      if (!samplesProgress[sampleId]) {
        samplesProgress[sampleId] = {};
      }

      if (!samplesProgress[sampleId][chromosome]) {
        samplesProgress[sampleId][chromosome] = [];
      }
      var result = _.filter(clusters[chromosome], function(cluster, index){
        if (cluster.getSequenceStart() <= sequenceEnd && cluster.getSequenceEnd() >= sequenceStart &&
            samplesProgress[sampleId][chromosome].indexOf(index) == -1) {
          samplesProgress[sampleId][chromosome].push(index);
          return true;
        }
        return false;
      });

      if (samplesProgress[sampleId])
        samplesProgress[sampleId] = null;

      return result;
    },

    /**
     * Getter of clusters.
     * @method getClusters
     * @returns {Array}
     */
    getClusters: function() {
      return clusters;
    },

    /**
     * Return options of clusterHandler
     * @method getOptions
     * @return {Object}
     */
    getOptions: function() {
      return {
        idealSequenceLength: idealSequenceLength
      }
    }
  }
}
