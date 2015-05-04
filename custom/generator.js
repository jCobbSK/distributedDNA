/**
 * Static class with methods of creating fixture data.
 * @class Generator
 * @module Custom
 */
var Models = require('../models'),
    Q = require('q'),
    _ = require('underscore'),
    Sequelize = require('sequelize'),
    fs = require('fs');
module.exports = (function() {

  /**
   * Object with static settings for class.
   * @property settings
   * @type {Object}
   */
  var settings = {
    patientName: 'Generator',
    additionalInfo: 'Generated Sample for POSITIVE patterns: ',
    additionalInfo2: ' and NEGATIVE patterns: ',
    nucleotidSigns: ['C', 'G', 'T', 'A']
  }

  /**
   * Creates control string for sequence with chromosome (0-indexed!!!) and
   * sequence start position.
   * @method getControlString
   * @private
   * @param {integer} chromosome
   * @param {integer} sequenceStart
   * @returns {string}
   */
  var getControlString = function(chromosome, sequenceStart) {
    return '['+(parseInt(chromosome)+1)+':'+sequenceStart+']';
  }

  /**
   * Returns random nucleotid sign. (C || G || T || A)
   * @method getRandomNucleotid
   * @private
   * @returns {char}
   */
  var getRandomNucleotid = function() {
    return settings.nucleotidSigns[Math.floor(Math.random()*4)];
  }

  /**
   * Create random DNA sequence of specified length.
   * @method getRandomSequence
   * @private
   * @param {integer} length
   * @returns {string}
   */
  var getRandomSequence = function(length) {
    var res = '';
    for (var i = 0; i < length; i++) {
      res += getRandomNucleotid();
    }
    return res;
  }

  /**
   * Cluster patterns into array of arrays, where every index represents
   * chromosome (0-indexed). Patterns in chromosome are sorted.
   * @method clusterPatternsByChromosomes
   * @param {Models.Pattern[]} patterns
   * @returns {Pattern[][]}
   */
  var clusterPatternsByChromosomes = function(patterns) {
    //cluster patterns by chromosome and sort them by sequenceStart
    var chromosomes = (function(){
      var res = [];
      for (var i=0, len=23; i<len;i++)
        res.push(new Array());
      return res;
    })();

    _.each(patterns, function(pattern) {
      chromosomes[pattern.chromosome - 1].push(pattern);
    });

    _.each(chromosomes, function(chromosomeArray) {
      chromosomeArray.sort(function(a, b) {
        return a.sequenceStart - b.sequenceStart;
      });
    });
    return chromosomes;
  }

  /**
   * Generate minimal sequence for corret patterns.
   * @method generateSequence
   * @private
   * @throws Error('Pattern collision')
   * @param {Array of Models.Pattern} positivePatterns
   * @param {Array of Models.Pattern} negativePatterns
   * @returns {string}
   */
  var generateSequence = function(positivePatterns, negativePatterns) {
    //refactor function for positive/negative params
    var getRealChromosomeResultLength = function() {
      return chromosomeResult.length - controlsLen;
    };

    var isPositivePattern = function(pattern) {
      return _.find(positivePatterns, function(pat){
        return pat.id == pattern.id;
      });
    };

    var shuffleSequence = function(isShuffling, sequence) {
      if (!isShuffling)
        return sequence;
      var changingIndex = Math.floor(Math.random()*sequence.length);
      console.log('Shuffling 1 ', sequence[changingIndex], changingIndex);
      if (sequence[changingIndex] == 'C' || sequence[changingIndex] == 'G' || sequence[changingIndex] == 'T')
        sequence = sequence.substr(0, changingIndex) + 'A' + sequence.substr(changingIndex + 1);
      else
        sequence = sequence.substr(0, changingIndex) + 'C' + sequence.substr(changingIndex + 1);
      console.log('Shuffling 2 ', sequence[changingIndex], changingIndex);
      return sequence;
    };

    var patterns = positivePatterns.concat(negativePatterns);
    var chromosomes = clusterPatternsByChromosomes(patterns);
    var result = '';
    var start = 0;
    var chromosomeResult = '';
    var controlsLen = 0;

    _.each(chromosomes, function(patternArray, index) {
      start = 0;
      chromosomeResult = '';
      controlsLen = 0;
      if (patternArray.length > 0) {
        chromosomeResult += getControlString(index, patternArray[0].sequenceStart);
        controlsLen = chromosomeResult.length;
        start = patternArray[0].sequenceStart;
      }
      _.each(patternArray, function(pattern) {
        //if part of pattern is in result - check if it is matched add rest of pattern into result otherwise throw error
        if (pattern.sequenceStart < start + getRealChromosomeResultLength()) {
          var chResSub = chromosomeResult.substr(pattern.sequenceStart - start + controlsLen);
          var patternSub = pattern.data.substr(0, start + getRealChromosomeResultLength() - pattern.sequenceStart);
          if (chResSub !== patternSub)
            throw new Error('Pattern collision');

          chromosomeResult += shuffleSequence(
                                !isPositivePattern(pattern),
                                pattern.data.substr(start + getRealChromosomeResultLength() - pattern.sequenceStart)
                              );
        }
        //if pattern starts at actual position of result, copy pattern into result
        else if (pattern.sequenceStart == start + getRealChromosomeResultLength()) {
          chromosomeResult += shuffleSequence( !isPositivePattern(pattern),pattern.data);
        }
        //if pattern starts after position of result generate rand sequence and copy pattern
        else if (pattern.sequenceStart > start + getRealChromosomeResultLength()) {
          chromosomeResult += getRandomSequence(pattern.sequenceStart - (start + getRealChromosomeResultLength()));
          chromosomeResult += shuffleSequence( !isPositivePattern(pattern),pattern.data);
        }
      });
      result += chromosomeResult;
    });

    return result;
  }

  return {
    /**
     * Creates sample record for user defined by username and
     * positive for all patterns in patternIds array.
     * @method createSample
     * @param {string} username
     * @param {Array of Integer} positivePatternIds
     * @param {Array of Integer} negativePatternIds
     * @param {function(Sample)} callback
     */
    createSample: function(username, positivePatternIds, negativePatternIds, callback) {
      //get patterns model instances for patternIds
      Q.all([
        Models.Pattern.findAll({
          where:{ id: positivePatternIds }
        }),
        Models.Pattern.findAll({
          where:{id: negativePatternIds}
        }),
        Models.User.find({
          where: {username: username}
        })
      ]).then(function(results){
        var positvePatterns = results[0];
        var negativePatterns = results[1];
        var user = results[2];
        var sequence = generateSequence(positvePatterns, negativePatterns);
        var tempPath = Math.floor(Math.random()*1000)+'.txt';
        Q.all([
          Q.nfcall(fs.writeFile, tempPath, sequence, 'utf-8'),
          Models.Sample.build({
            UserId: user.id,
            isDone: false,
            patientName: settings.patientName,
            additionalInfo: settings.additionalInfo + positivePatternIds + settings.additionalInfo2 + negativePatternIds
          }).save()
        ]).then(function(results){
          var sample = results[1];
          var correctPath = '/samples/'+user.id+'_'+sample.id+'.dna';
          Q.nfcall(fs.rename, tempPath, './'+correctPath).then(function(){
            sample.dataPath = '.'+correctPath;
            sample.save().then(function(sample){
              callback(null, sample);
            });
          }).catch(function(err){
            callback(err);
          })
        }).catch(function(err){
          callback(err);
        })
      }).catch(function(err){
        callback(err);
      })
    },

    /**
     * Call private method generateSequence.
     * @method generateSequence
     * @param {Array of Models.Pattern} patterns
     * @returns {string}
     */
    generateSequence: function(patterns) {
      return generateSequence(patterns);
    }
  }
})();
