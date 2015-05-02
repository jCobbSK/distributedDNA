var Generator = require('../custom/generator'),
    assert = require('assert');

describe('Generator of samples', function(){
  describe('#generateSequence', function(){
    var pat1 = {
      data: 'ccggaatt',
      sequenceStart: 0,
      chromosome: 1
    }

    var pat2 = {
      data: 'cgat',
      sequenceStart: 8,
      chromosome: 1
    }

    var pat3 = {
      data: 'ttttt',
      sequenceStart: 6,
      chromosome: 1
    }

    var pat4 = {
      data: 'ctctct',
      sequenceStart: 1,
      chromosome: 2
    }

    var pat5 = {
      data: 'atcb',
      sequenceStart: 10,
      chromosome: 1
    }

    it('should return sequence for 2 chromosomes', function() {
      var res = Generator.generateSequence([pat1, pat4]);
      assert(res == '[1:0]ccggaatt[2:1]ctctct');
    })

    it('should concat patterns', function() {
      var res = Generator.generateSequence([pat1, pat2]);
      assert(res == '[1:0]ccggaattcgat');
    })

    it('should throw error of colliding patterns', function() {
      assert.throws(
        function() {
          Generator.generateSequence([pat2, pat3]);
        },
        Error,
        'Pattern collision'
      )
    })

    it('shouldn\'t throw error of colliding patterns', function() {
      var res = Generator.generateSequence([pat2, pat5]);
      assert(res == '[0:8]cgatcb');
    })

    it('should filled empty spaces with random data', function() {

    })

  })

  describe('#createSample', function(){

  })
})
