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
 * @param {Array of models.Pattern} [options.patterns] Array of Pattern objects
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
  var chromosome = options['chromosome'] || 1;

  /**
   * Start index of cluster
   * @property sequenceStart
   * @type {integer}
   * @default 0
   * @private
   */
  var sequenceStart = options['sequenceStart'] || 0;

  /**
   * End index of cluster
   * @property sequenceEnd
   * @type {integer}
   * @default 100000
   * @private
   */
  var sequenceEnd = options['sequenceEnd'] || 100000;

  /**
   * Patterns in cluster.
   * @property patterns
   * @private
   * @type {Array of models.Pattern}
   */
  var patterns = options['patterns'] || [];

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
     */
    addPattern: function(pattern) {
      if (sequenceStart > pattern.sequenceStart)
        sequenceStart = pattern.sequenceStart;

      if (sequenceEnd < pattern.sequenceEnd)
        sequenceEnd = pattern.sequenceEnd;

      patterns.push(pattern);
    }
  }
}
