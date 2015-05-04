/**
 * Class for handling asynchronous loading of DNA sample sequence.
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

  /**
   * Sequence might contain multiple chromosomes, defined by certain rules defined in DNAAnalysis.index
   * @property actualChrosome
   * @private
   * @type {integer}
   */
  var actualChromosome = -1;

  return {
    /**
     * Add chunk of data to sequence.
     * @method addChunk
     * @param {string} chunk
     * @param {function} endChromosomeCallback(sequence, chromosomeNumber, startIndex)
     */
    addChunk: function(chunk, endChromosomeCallback) {
      sequence += chunk;
      //check for chromosome specifications in sequence
      do {
        var startControl = sequence.indexOf('[');
        var endControl = sequence.indexOf(']');
        if (startControl != -1 && endControl != -1) {
          var control = sequence.substring(startControl+1, endControl);

          //we are starting new potion of sample, we need to call the end of previous one
          if (endChromosomeCallback && actualChromosome != -1) {
              endChromosomeCallback(sequence.substring(0, startControl), actualChromosome, startIndex);
          }

          //set new states
          if (control.indexOf(':') != -1) {
            var arr = control.split(':');
            actualChromosome = parseInt(arr[0]);
            startIndex = parseInt(arr[1]);
          } else {
            actualChromosome = parseInt(control);
            startIndex = 0;
          }
          sequence = sequence.substring(endControl+1);
        }
      }while(startControl != -1 && endControl != -1);
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
        return sequence.substring(_startIndex - this.getStartIndex(), _endIndex - this.getStartIndex() + 1);
      }
      return null;
    },

    /**
     * Getter for actual chromosome number of sequence in sequence property.
     * @method getChromosomeNumber
     * @returns {integer}
     */
    getChromosomeNumber: function() {
      return actualChromosome;
    }
  }

}