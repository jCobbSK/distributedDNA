/**
 * Class for manipulating with partially loaded sample sequence.
 * @class SampleReader
 * @module DNAAnalysis
 */
module.exports = function() {
  /**
   * Sequence of interest
   * @property sequence
   * @private
   * @type {string}
   */
  var sequence = '';

  /**
   * Begining index of sequence.
   * @property startIndex
   * @private
   * @type {integer}
   */
  var startIndex = 0;

  return {
    /**
     * Add chunk of data to sequence.
     * @method addChunk
     * @param {string} chunk
     */
    addChunk: function(chunk) {
      sequence += chunk;
    },

    /**
     * Trim sequence to new start index.
     * @method trimBeginToIndex
     * @param {integer} newStartIndex
     * @throws Error('Can\'t trim to index before actual')
     */
    trimBeginToIndex: function(newStartIndex) {
      if (newStartIndex < startIndex)
        throw new Error('Can\'t trim to index before actual');
      var lengthToTrim = newStartIndex - startIndex;
      sequence = sequence.substring(lengthToTrim);
      startIndex = newStartIndex;
    },

    /**
     * Getter for startIndex
     * @method getStartIndex
     * @returns {integer}
     */
    getStartIndex: function() {
      return startIndex;
    },

    /**
     * Getter for endIndex, simple calculation as startIndex + length of sequence
     * @method getEndIndex
     * @returns {integer}
     */
    getEndIndex: function() {
      return startIndex + sequence.length;
    },

    /**
     * Getter for sequence.
     * @method getSequence
     * @returns {string}
     */
    getSequence: function() {
      return sequence;
    },

    /**
     * Returns part of sequence if whole sequence from startIndex to endIndex is loaded in sequence,
     * otherwise return null.
     * @method getPartOfSequence
     * @param {integer} _startIndex
     * @param {integer} _endIndex
     * @returns {string|null}
     */
    getPartOfSequence: function(_startIndex, _endIndex) {
      if (this.getStartIndex() <= _startIndex && this.getEndIndex() >= _endIndex) {
        return sequence.substring(_startIndex - this.getStartIndex(), _endIndex - this.getStartIndex());
      }
      return null;
    }
  }

}