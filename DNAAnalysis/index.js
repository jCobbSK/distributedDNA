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
    SampleReader = require('./sampleReader'),
    ClusterHandler = require('./clusterHandler'),
    Pattern = require('../models/pattern'),
    Settings = require('./settings'),
    Models = require('../models'),
    _ = require('underscore');
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
    Models.Pattern.findAll().then(function(results){
      _.each(results, function(patt){
        clusterHandler.addPattern(patt);
      });
      //finalize clustering
      clusterHandler.finalizeClustering();

      //JDSM on connect && on disconnect handlers
      JDSM.setCallbacks(registerNode, unregisterNode);
    });
  }).call(this);

  /**
   * Method for determining if we have enough nodes for redistribution of clusters on Nodes.
   * @method isCachingClustersInNodes
   * @private
   * @returns {boolean}
   */
  var isCachingClustersInNodes = function() {
    return (clusterHandler.allClustersCount() / nodes.length) < Settings.clusterNodeRatioForCache;
  }

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
    //pick correct request based on isCachingClustersInNodes
    var requestsArr;
    if (isCachingClustersInNodes()) {
      requestsArr = [
        {
          node: cluster.getHandlingNode(),
          requestData: {
            eventName: 'analyze',
            data: {
              clusterId: cluster.id,
              sampleSequence: sampleReader.getPartOfSequence(cluster.getSequenceStart(), cluster.getSequenceEnd()),
              sampleId: sampleId
            }
          }
        }
      ];
    } else {
      requestsArr = [
        {
          node: cluster.getHandlingNode(),
          requestData: {
            eventName: 'analyzeNoCache',
            data: {
              sampleSequence: sampleReader.getPartOfSequence(cluster.getSequenceStart(), cluster.getSequenceEnd()),
              sampleSequenceStart: cluster.getSequenceStart(),
              sampleSequenceEnd: cluster.getSequenceEnd(),
              sampleId: sampleId,
              patterns: _.map(cluster.getPatterns(), function(pattern){
                return {
                  id: pattern.id,
                  sequence: pattern.data,
                  sequenceStart: pattern.sequenceStart,
                  sequenceEnd: pattern.sequenceEnd,
                  chromosome: pattern.chromosome
                }
              })
            }
          }
        }
      ];
    }

    JDSM.sendAsyncRequest(requestsArr, function(err, data){
      //handle response -> create model.result
      console.log('RESULT from CLIENT!!!!!!!!!!!!', data);
      _.each(data, function(data){
        var sampleId = data.sampleId;
        _.each(data.results, function(res){
          Models.Result.build({
            SampleId: sampleId,
            PatternId: res.patternId,
            result: res.result
          }).save()
            .then(function(result){
              //TODO push to front-end of client
              console.log('created result');
            })
            .catch(function(err){
              throw new Error('Can\'t save pattern');
            })
        })
      })
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
   * Remove specific number of clusters from each node and return array of these clusters.
   * @method removeClustersFromNodes
   * @private
   * @param {integer}numberOfRemovedClusters
   * @returns {Array of clusters}
   */
  var removeClustersFromNodes = function(numberOfRemovedClusters) {

    var result = [];
    _.each(nodes, function(node){
      var removedClusters = node.clusters.splice(0,numberOfRemovedClusters);
      //create request to clear removedClusters to node
      JDSM.sendAsyncRequest([{
        node: node,
        requestData: {
          eventName: 'freeClusters',
          data: _.map(removedClusters, function(cluster){
            return cluster.id;
          })
        }
      }], function(){
        console.log('REMOVED clusters from node');
      });
      result.push(removedClusters);
    });

    return result;
  }

  /**
   * Add clusters evenly to all nodes.
   * @method distributeClustersToNodes
   * @private
   * @param {Array of DNAAnalysis.Cluster} clusters
   */
  var distributeClustersToNodes = function(clusters) {
    var sendingClustersCount = clusters.length / nodes.length;
    _.each(nodes, function(_node){
      var addingClusters = clusters.splice(0, sendingClustersCount);
      _.each(addingClusters, function(cluster){
        _node.clusters.push(cluster);
      })
      //create request to send addingClusters to node
      JDSM.sendAsyncRequest([{
        node: _node.node,
        requestData:{
          eventName: 'addClusters',
          data: _.map(addingClusters, function(cluster){
            return {
              clusterId: cluster.id,
              clusterSequenceStart: cluster.getSequenceStart(),
              clusterSequenceEnd: cluster.getSequenceEnd(),
              patterns: _.map(cluster.patterns, function(pattern){
                return {
                  id: pattern.id,
                  sequence: pattern.data,
                  sequenceStart: pattern.sequenceStart,
                  sequenceEnd: pattern.sequenceEnd,
                  chromosome: pattern.chromosome
                }
              })
            }
          })
        }
      }], function(){
        console.log('ADDED clusters to node');
      })
    })
  }

  /**
   * Callback when new Node is registered.
   * @method registerNode
   * @private
   * @param {JDSM.Node} node
   */
  var registerNode = function(node) {
    console.log('REGISTERING NODE');
    var clustersForNewNode = [];
    var startingCalculation = (nodes.length == 0);

    if (nodes.length == 0) {
      //all clusters put into first node
      var allClusters = clusterHandler.getAllClustersAsArray();
      clustersForNewNode = allClusters;
    } else {
      //remove certain amount of clusters from all nodes and put them into newly connected node
      var numberOfClusters = clusterHandler.allClustersCount();
      clustersForNewNode = removeClustersFromNodes(Math.floor(numberOfClusters/nodes.length - numberOfClusters/(nodes.length + 1)));
    }

    nodes.push({
      node: node,
      clusters: clustersForNewNode
    });

    _.each(clustersForNewNode, function(cluster){
      cluster.setHandlingNode(node);
    });

    //after first node has been registered we have computing power to start computation of
    //not finished samples
    if (startingCalculation)
      initialCalculation();
  }

  /**
   * Callback when Node disconnects
   * @method unregisterNode
   * @private
   * @param {JDSM.Node} node
   * @param {Array of JDSM.Request} pendingRequests
   */
  var unregisterNode = function(node, pendingRequests) {
    console.log('UNREGISTERING NODE');
    //redistributed node's clusters to other nodes
    var internalNode = _.find(nodes, function(_node){
      return _node.node.getId() == node.getId();
    });

    nodes.splice(nodes.indexOf(internalNode),1);

    //stop redistributing if no nodes available
    if (nodes.length == 0)
      return;

    distributeClustersToNodes(internalNode.clusters);
    //TODO resend pendingRequests
  }

  /**
   * A method called in the beginning of calculation, after first node has connected and calculation
   * may begun. We seek all not finished samples and make steps to finish them.
   * @method initialCalculation
   * @private
   */
  var initialCalculation = function() {
    //get all not finished samples from DBS and call analyzePartialyFinished on them
    Models.Sample.findAll({
      where: {isDone: false},
      include: [{model: Models.Result, as: 'Results'}]
    }).then(function(samples){
      _.each(samples, function(sample){
        analyzePartialyFinished(sample);
      })
    })
  }

  /**
   * Similar method to analyzeSample but with difference, that some of patterns have already been
   * resolved so we don't want to call them again.
   * @method analyzePartial
   * @private
   * @param {models.Sample} sample
   * @throws Error(Can't read file)
   */
  var analyzePartialyFinished = function(sample) {
    var sr = new SampleReader();

    fs.readFile(sample.dataPath, 'utf-8', function(err, data){
      if (err) {
       throw new Error('Can\'t read file');
      }
      var clustersForSequence = [];
      sr.addChunk(data, function(sequence, chromosomeNumber, startIndex){
        clustersForSequence = clusterHandler.finishAnalyzingSample(
          sample.id,chromosomeNumber, startIndex,
            startIndex + sequence.length);
        filterDoneClusters(sample, clustersForSequence, function(clustersForSequence){
          analyzeClusters(sr,clustersForSequence, sample.id);
        });
      })

      //check if sr.sequence is for some cluster
      clustersForSequence = clusterHandler.getClustersForSample(sample.id, sr.getChromosomeNumber(),sr.getStartIndex(),sr.getEndIndex());
      filterDoneClusters(sample, clustersForSequence, function(clustersForSequence){
        analyzeClusters(sr,clustersForSequence, sample.id);
      });
    })
  }

  /**
   * Filter clusters where all patterns are resolved for sample. If one or more are not resolved (hasn't got result)
   * we return that cluster in return and is put for further proceed.
   * @method filterDoneClusters
   * @private
   * @param {models.Sample} sample with loaded Results in sample.Results
   * @param {Array of DNAAnalysis.Cluster} clusters
   * @param {function(clusters)} callback
   * @returns {Array of DNAAnalysis.Cluster}
   */
  var filterDoneClusters = function(sample, clusters, callback) {

    //filter clusters only with at least 1 pattern not in results
    var res = _.filter(clusters, function(cluster){
      var foundNotResolvedPattern = _.find(cluster.getPatterns(), function(pattern){
        var foundPatternInResults = _.find(sample.Results, function(result){
          return result.PatternId == pattern.id;
        });
        return !foundPatternInResults;
      });
      return foundNotResolvedPattern;
    })
    callback(res);
  }

  return {
    /**
     * Start analyzing sample.
     * @method analyzeSample
     * @param {models.Sample} sample database object
     * @throws Error(Can't read file)
     */
    analyzeSample: function(sample) {
      var sr = new SampleReader();

      fs.readFile(sample.dataPath, 'utf-8', function(err, data){
        if (err) {
          throw new Error('Can\'t read file');
        }
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