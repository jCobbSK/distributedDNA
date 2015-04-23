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
    ClusterHandler = require('./clusterHandler');
module.exports = function(JDSM) {

  var clusterHandler = new ClusterHandler();

  /**
   * @constructor
   */
  (function init(){
    //TODO for all patterns clusterHandler.addPattern
    //TODO clusterHandler.finalizeCLustering
  }).call(this);

  return {
    /**
     * Start analyzing sample.
     * @method analyzeSample
     * @param {string} pathToFile Path to file with sample.
     */
    analyzeSample: function(pathToFile) {
      var sr = new SimpleReader();
      //chromosome number, index of cluster
      var clusterIndices = [0,0];
      fs.readFile(pathToFile, function(err, data){

      });
    }
  }
}