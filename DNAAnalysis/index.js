/**
 * Module with implementation of JDSM for purpose of analysing DNA sequences.
 *
 * Sample is file with following formatting:
 * 1. start of chromosome is defined by [numberOfChromosome] where numberOfChromosome is integer <1,23>
 * 2. if we want a part of chromosome we define [numberOfChromosome:initialIndex] where initialIndex is
 *    integer of position of start
 * e.q [1]cccgtaccttta[2]cccggggg[13:100]cccc is valid sample file string
 *
 * @module DNAAnalysis
 * @param {JDSM module instance} JDSM
 */
var fs = require('fs'),
    SimpleReader = require('./simpleReader'),
    ClusterHandler = require('./clusterHandler'),
    Pattern = require('../models/pattern');
module.exports = function(JDSM) {

  /**
   * Cluster handler property for managing clusters.
   * @property clusterHandler
   * @private
   * @type {DNAAnalysis.ClusterHandler}
   */
  var clusterHandler = ClusterHandler();

  /**
   * Local manager of nodes. It is handled by registerNode and unregisterNode callbacks.
   * @property nodes
   * @private
   * @type {Array of Object}
   */
  var nodes = [];

  /**
   * @constructor
   */
  (function init(){

    //add all patterns into cluster handler
    Pattern.findAll().then(function(results){
      _.each(results, function(patt){
        clusterHandler.addPattern(patt);
      });
      //finalize clustering
      clusterHandler.finalizeClustering();
    });

    //JDSM on connect && on disconnect handlers
    JDSM.setCallbacks(registerNode, unregisterNode);
  }).call(this);

  /**
   * Create and send request for analyze to cluster's node.
   * @method analyzeCluster
   * @private
   * @param {DNAAnalysis.SampleReader] sampleReader
   * @param {DNAAnalysis.Cluster} cluster
   * @param {integer} sampleId
   */
  var analyzeCluster = function(sampleReader, cluster, sampleId) {
    //create request to node
    var requestsArr = [
      {
        node: cluster.getHandlingNode(),
        requestData: {
          type: 'analyze',
          data: {
            sampleSequence: sampleReader.getPartOfSequence(cluster.getSequenceStart(), cluster.getSequenceEnd()),
            sampleId: sampleId
          }
        }
      }
    ];
    JDSM.sendAsyncRequest(requestsArr, function(err, data){
      //TODO handle response -> create model.result
      console.log('RESULT from CLIENT!!!!!!!!!!!!', data);
    });
  }

  /**
   * Equivalent to analyzeCluster method but with array of clusters.
   * @method analyzeClusters
   * @private
   * @param {DNAAnalysis.SampleReader} sampleReader
   * @param {Array of DNAAnalysis.Cluster} clusters
   * @param {integer} sampleId
   */
  var analyzeClusters = function(sampleReader, clusters, sampleId) {
    _.each(clusters, function(cluster){
      analyzeCluster(sampleReader, cluster, sampleId);
    });
  }

  /**
   * Callback when new Node is registered.
   * @method registerNode
   * @private
   * @param {JDSM.Node} node
   */
  var registerNode = function(node) {
    //TODO put correct node to all clusters
    nodes.push(node);
  }

  /**
   * Callback when Node disconnects
   * @method unregisterNode
   * @private
   * @param {JDSM.Node} node
   * @param {Array of JDSM.Request} pendingRequests
   */
  var unregisterNode = function(node, pendingRequests) {
    //TODO redistributed node's clusters to other nodes
    //TODO resend pendingRequests
    nodes.splice(_.find(nodes,function(_node){return node == _node.node}),0)
  }

  return {
    /**
     * Start analyzing sample.
     * @method analyzeSample
     * @param {models.Sample} sample database object
     */
    analyzeSample: function(sample) {
      var sr = new SimpleReader();

      fs.readFile(sample.dataPath, function(err, data){
        var clustersForSequence = [];
        sr.addChunk(data, function(sequence, chromosomeNumber, startIndex){
          //send data to relative clusters
          clustersForSequence = clusterHandler.finishAnalyzingSample(
                                    sample.id,chromosomeNumber, startIndex,
                                    startIndex + sequence.length);
          analyzeClusters(sr,clustersForSequence, sample.id);
        })

        //check if sr.sequence is for some cluster
        clustersForSequence = clusterHandler.getClustersForSample(sample.id, sr.getChromosomeNumber(),sr.getStartIndex(),sr.getEndIndex());
        analyzeClusters(sr,clustersForSequence, sample.id);
      });
    }
  }
}