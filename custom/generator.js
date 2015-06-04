/**
 * Static class with methods of creating fixture data.
 * @class Generator
 * @module Custom
 */
var Models = require('../models'),
    Q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    colors = require('colors');
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
   * 0-indexed array of length of each chromosome.
   * @property chromosomeLengths
   * @type {Array}
   */
  var chromosomeLengths = [248956422, 242193529, 198295559,
                           190214555, 181538259, 170805979,
                           159345973, 145138636, 138394717,
                           133797422, 135086622, 133275309,
                           114364328, 107043718, 101991189,
                           90338345, 83257441, 80373285,
                           58617616, 64444167, 46709983,
                           50818468,156040895];

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
   * Create random DNA sequence of specified length. Optional argument repeatSize for better performance
   * that we generate random sequence of size repeatSize and copy it length / repeatSize times.
   * @method getRandomSequence
   * @private
   * @param {integer} length
   * @param {integer} repeatSize (optional)
   * @returns {string}
   */
  var getRandomSequence = function(length, repeatSize) {
    if (!repeatSize)
      repeatSize = length;
    var res = '';
    for (var i = 0; i < repeatSize; i++) {
      res += getRandomNucleotid();
    }
    var result = '';
    for (var i = 0, len = length / repeatSize; i < len; i++) {
      result += res;
    }
    if (length % repeatSize != 0) {
      result += res.substr(0, length % repeatSize);
    }
    return result;
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
   * @param {string} path - output file
   * @param {function} callback - callback after generated sequence successfully flushed on disk
   */
  var generateSequence = function(positivePatterns, negativePatterns, path, callback) {
    //refactor function for positive/negative params
    var isPositivePattern = function(pattern) {
      return _.find(positivePatterns, function(pat){
        return pat.id == pattern.id;
      });
    };

    var shuffleSequence = function(isShuffling, sequence) {
      if (!isShuffling)
        return sequence;
      var changingIndex = Math.floor(Math.random()*sequence.length);
      if (sequence[changingIndex] == 'C' || sequence[changingIndex] == 'G' || sequence[changingIndex] == 'T')
        sequence = sequence.substr(0, changingIndex) + 'A' + sequence.substr(changingIndex + 1);
      else
        sequence = sequence.substr(0, changingIndex) + 'C' + sequence.substr(changingIndex + 1);
      return sequence;
    };

    var stream = fs.createWriteStream(path, {encoding: 'utf-8'});

    var patterns = positivePatterns.concat(negativePatterns);
    var chromosomes = clusterPatternsByChromosomes(patterns);
    var actualChromosome = -1;
    while(++actualChromosome < chromosomes.length && chromosomes[actualChromosome].length == 0);

    stream.on('drain', function(){
      while(++actualChromosome < chromosomes.length && chromosomes[actualChromosome].length == 0);
      writeChromosome();
    });

    stream.on('finish', function(){
      if (throwingError) {
        fs.unlinkSync(path);
        callback(throwingError);
      } else {
        callback(null, true);
      }
    });

    stream.on('moveOn', function(){
      while(++actualChromosome < chromosomes.length && chromosomes[actualChromosome].length == 0);
      writeChromosome();
    });

    var chromosomeResult = '';
    var throwingError = false;

    var writeChromosome = function() {

      var getRealChromosomeResultLength = function() {
        return chromosomeResult.length - controlsLen;
      };

      if (actualChromosome >= chromosomes.length) {
        stream.end('');
        return;
      }
      var patternArray = chromosomes[actualChromosome];
      var start = 0;
      chromosomeResult = '';
      var controlsLen = 0;

      if (patternArray.length > 0) {
        chromosomeResult += getControlString(actualChromosome, patternArray[0].sequenceStart);
        controlsLen = chromosomeResult.length;
        start = patternArray[0].sequenceStart;
      }
      _.each(patternArray, function(pattern) {
        if (throwingError)
          return;
        //if part of pattern is in result - check if it is matched add rest of pattern into result otherwise throw error
        if (pattern.sequenceStart < start + getRealChromosomeResultLength()) {
          var chResSub = chromosomeResult.substr(pattern.sequenceStart - start + controlsLen);
          var patternSub = pattern.data.substr(0, start + getRealChromosomeResultLength() - pattern.sequenceStart);
          if (chResSub !== patternSub) {
            //patterns are colliding, delete file
            throwingError = new Error('Colliding patterns');
            stream.end('');
            return;
          }

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
          chromosomeResult += getRandomSequence(pattern.sequenceStart - (start + getRealChromosomeResultLength()),1000);
          chromosomeResult += shuffleSequence( !isPositivePattern(pattern),pattern.data);
        }
      });

      if(!throwingError) {
        stream.write(chromosomeResult);
        stream.emit('moveOn');
      }

    }

    writeChromosome();
  }

  /**
   * Method for writing positive and negative patterns into file. This method just copy all provided
   * patterns as it goes, doesn't merge them, nor sort them. Such method is generateSequence.
   * @private
   * @method copyPatternsIntoSequence
   * @param {string} path - output file path
   * @param {Array of Model.Pattern} positivePatterns
   * @param {Array of Model.Pattern} negativePatterns
   * @param {function} callback
   */
  var copyPatternsIntoSequence = function(path, positivePatterns, negativePatterns, callback) {
    var getSequenceForPattern = function(pattern, shuffling) {
      var data = (!shuffling) ? pattern.data : getRandomSequence(pattern.data.length, 1000);
      return '['+pattern.chromosome+':'+pattern.sequenceStart+']'+data;
    }
    var stream = fs.createWriteStream(path, {encoding: 'utf-8', mode: 0666});

    stream.on('finish', function(){
      callback(null);
    });

    _.each(positivePatterns, function(p){
      stream.write(getSequenceForPattern(p, false));
    });
    _.each(negativePatterns, function(p){
      stream.write(getSequenceForPattern(p, true));
    });

    stream.end(' ');
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
        var positivePatterns = results[0];
        var negativePatterns = results[1];
        var user = results[2];
        var tempPath = Math.floor(Math.random()*10000000)+'.txt';
        copyPatternsIntoSequence(tempPath, positivePatterns, negativePatterns, function(err){
          if (err) {
            console.log('ERROR: ', tempPath);
            fs.unlink(tempPath, function(){
              callback(err);
            });
            return;
          }
          Q.all([
            Models.Sample.build({
              UserId: user.id,
              isDone: false,
              patientName: settings.patientName,
              additionalInfo: settings.additionalInfo + positivePatternIds + settings.additionalInfo2 + negativePatternIds
            }).save()
          ]).then(function(results){
            var sample = results[0];
            var correctPath = '/samples/'+user.id+'_'+sample.id+'.dna';
            Q.nfcall(fs.rename, tempPath, './'+correctPath)
              .then(function(){
                sample.dataPath = '.'+correctPath;
                sample.save().
                  then(function(sample){
                    callback(null, sample);
                  })
                  .catch(function(err){
                    console.log('FU!', err);
                    callback(err);
                  })
              }).catch(function(err){
                console.log('FUCK YOU!!!!!!!!!', err);
                callback(err);
            });
          }).catch(function(err){
            callback(err);
          })
        });


      }).catch(function(err){
        callback(err);
      })
    },

    /**
     * Generate sampleCount samples with desiredPatternCount positive and negative patterns each.
     * e.q. generateRandomSamples('client', 10, 10, done) -- creates 10 samples for user with username 'client' where sample
     * is positive for 10 random patterns and negative for 10 other random patterns.
     *
     * @method generateRandomSamples
     * @param {string} username
     * @param {integer} sampleCount
     * @param {integer} desiredPatternCount
     * @param {function} callback
     */
    generateRandomSamples: function(username, sampleCount, desiredPatternCount, callback) {
      var self = this;
      Models.Pattern.findAll({
        attributes: ['id']
      })
        .then(function(patternIds){

          var patternCount = patternIds.length;
          var alreadyCreated = 0;
          var createdSamples = [];
          patternIds = _.map(patternIds, function(pattern){
            return pattern.id;
          });

          if (2*desiredPatternCount > patternCount) {
            callback( new Error('More desired patterns than actual patterns') );
            return;
          }

          for (var i= 0; i<sampleCount;i++) {
            //pick M random patterns for positive and M for negative -> pick 2*M patterns and split array into half
            var alreadyPicked = 0;
            var patternCount = patternIds.length;
            var randomPatterns = _.filter(patternIds, function() {
              if (alreadyPicked == 2*desiredPatternCount)
                return false;
              var control = Math.random() < (2*desiredPatternCount / patternCount);
              if (control)
                alreadyPicked++;
              return control;
            });

            var positive = randomPatterns.slice(0, Math.ceil(alreadyPicked / 2)).sort(function(a,b){
              return a - b;
            });
            var negative = randomPatterns.slice(Math.ceil(alreadyPicked / 2) + 1).sort(function(a,b){
              return a - b;
            });

            self.createSample(username, positive, negative, function(err, sample){
              if (sample)
                createdSamples.push(sample);
              if (++alreadyCreated == sampleCount) {
                callback(null,createdSamples);
              }

            });
          }

        })
        .catch(function(err){
          throw err;
          throw new Error('Can\'t fetch all patterns');
        })
    },

    /**
     * Generates random DNA sequence for all chromosomes (approx 4GB file)
     * @method generateDNAfile
     * @param {string] path - path for output file
     * @param {function} callback
     */
    generateDNAfile: function(path,callback) {
      var stream = fs.createWriteStream(path, {encoding: 'utf-8'});
      var actualChromosome = 1;
      var actualPosition = 0;
      var flushChunkSize = 10000000;

      var write = function() {
        if (actualChromosome == 24) {
          stream.end('');
          return;
        }

        var sequence = (actualPosition == 0) ? '['+actualChromosome+':0]' : '';
        var chunkSize = (chromosomeLengths[actualChromosome - 1] - actualPosition - flushChunkSize < 0) ? chromosomeLengths[actualChromosome - 1] - actualPosition : flushChunkSize;
        actualPosition += chunkSize;
        sequence += getRandomSequence(chunkSize, 1000);

        stream.write(sequence);
        if (actualPosition == chromosomeLengths[actualChromosome - 1]) {
          console.log('Chromosome '+actualChromosome+' GENERATED!');
          actualChromosome++;
          actualPosition = 0;
        }
      }

      stream.on('drain', function(){
        write();
      });

      stream.on('finish', function(){
        callback();
      });

      write();
    },

    /**
     * Call private method generateSequence.
     * @throws Error('Pattern collision')
     * @param {Array of Models.Pattern} positivePatterns
     * @param {Array of Models.Pattern} negativePatterns
     * @param {string} path - output file
     * @param {function} callback - callback after generated sequence successfully flushed on disk
     */
    generateSequence: function(positivePatterns, negativePatterns, path, callback) {
      generateSequence(positivePatterns, negativePatterns, path, callback);
    }
  }
})();
