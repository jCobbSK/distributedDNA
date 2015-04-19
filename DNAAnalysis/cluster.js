/**
 * Cluster object used as elemental part of compute process. Patterns are clustered based on their's
 * location on chromosome and sequenceStart and sequenceEnd are modified accordingly
 * @class Cluster
 * @module DNAAnalysis
 *
 * @constructor
 * @param {Object} [options] Object with constructor parameters
 * @param {integer} [options.id] Unique id of cluster
 * @param {integer} [options.sequenceStart] Start of cluster
 * @param {integer} [options.sequenceEnd] End of cluster
 */
module.exports = function(options) {
  if (!options)
    options = {};

  /**
   * Unique id of Cluster
   * @property id
   * @type {integer}
   * @default -1
   * @private
   */
  var id = options['id'] || -1;

  /**
   * Chromosome number of cluster
   * @property chromosome
   * @type {integer}
   * @default 1
   * @private
   */
  var chromosome = options['chromosome'] || -1;

  /**
   * Start index of cluster
   * @property sequenceStart
   * @type {integer}
   * @default 0
   * @private
   */
  var sequenceStart = options['sequenceStart'] || -1;

  /**
   * End index of cluster
   * @property sequenceEnd
   * @type {integer}
   * @default 100000
   * @private
   */
  var sequenceEnd = options['sequenceEnd'] || -1;

  /**
   * Patterns in cluster.
   * @property patterns
   * @private
   * @type {Array of models.Pattern}
   */
  var patterns = [];

  return {

    /**
     * Change chromosome number of cluster.
     * @method changeChromosome
     * @param {integer} newChromosome
     */
    changeChromosome: function(newChromosome) {
      chromosome = newChromosome;
    },

    /**
     * Resize sequence, if either parameter is null, the property doesn't change.
     * @method resizeSequence
     * @param {integer} start
     * @param {integer} end
     */
    resizeSequence: function(start, end) {
      if (start != null)
        sequenceStart = start;

      if (end != null)
        sequenceEnd = end;
    },

    /**
     * Add pattern to cluster, sequenceStart and sequenceEnd will expand if neccessery.
     * @method addPattern
     * @param {models.Pattern} pattern
     * @throws {Error}
     */
    addPattern: function(pattern) {

      if(chromosome == -1)
        chromosome = pattern.chromosome;
      else if (chromosome != pattern.chromosome)
        throw new Error('Can\'t add pattern to cluster with different chromosome number');

      if (sequenceStart == -1)
        sequenceStart = pattern.sequenceStart;
      else if (sequenceStart > pattern.sequenceStart)
        sequenceStart = pattern.sequenceStart;

      if (sequenceEnd == -1)
        sequenceEnd = pattern.sequenceEnd
      else if (sequenceEnd < pattern.sequenceEnd)
        sequenceEnd = pattern.sequenceEnd;

      patterns.push(pattern);
    },

    /**
     * Get sequence bounds if pattern is added to cluster.
     * @method simulateAddPattern
     * @param pattern
     * @return {Object} sequenceStart, sequenceEnd, sequenceLength
     */
    simulateAddPattern: function(pattern) {
      var seqStart = sequenceStart;
      var seqEnd = sequenceEnd;
      if (seqStart == -1)
        seqStart = pattern.sequenceStart;
      else if(seqStart > pattern.sequenceStart)
        seqStart = pattern.sequenceStart;

      if(seqEnd == -1)
        seqEnd = pattern.sequenceEnd;
      else if (seqEnd < pattern.sequenceEnd)
        seqEnd = pattern.sequenceEnd;

      return {
        'sequenceStart': seqStart,
        'sequenceEnd': seqEnd,
        'sequenceLength': seqEnd - seqStart
      }
    },

    /**
     * Getter of chromosome number
     * @method getChromosome
     * @returns {integer}
     */
    getChromosome: function() {
      return chromosome;
    },

    /**
     * Getter of sequence start
     * @method getSequenceStart
     * @returns {integer}
     */
    getSequenceStart: function() {
      return sequenceStart;
    },

    /**
     * Getter of sequence end
     * @method getSequenceEnd
     * @returns {integer}
     */
    getSequenceEnd: function() {
      return sequenceEnd;
    },

    /**
     * Get sequence length.
     * @nethod getSequenceLength
     * @returns {integer}
     */
    getSequenceLength: function() {
      return sequenceEnd - sequenceStart;
    },

    /**
     * Get all patterns of this cluster.
     * @method getPatterns
     * @returns {Array of Pattern}
     */
    getPatterns: function() {
      return patterns;
    },

    /**
     * Get all properties, used during testing.
     * @method toString
     * @return {String}
     */
    toString: function() {
      return 'Id:'+id+';Chromosome:'+chromosome
             + ';SequenceStart:'+sequenceStart+';SequenceEnd:'+sequenceEnd
             + ';PatternsLength:'+patterns.length;
    }
  }
}
