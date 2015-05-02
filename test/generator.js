var Generator = require('../custom/generator'),
    assert = require('assert');

describe('Generator of samples', function(){
  describe('#generateSequence', function(){
    var pat1 = {
      data: 'CCGGAATT',
      sequenceStart: 0,
      chromosome: 1
    }

    var pat2 = {
      data: 'CGAT',
      sequenceStart: 8,
      chromosome: 1
    }

    var pat3 = {
      data: 'TTTTT',
      sequenceStart: 6,
      chromosome: 1
    }

    var pat4 = {
      data: 'CTCTCT',
      sequenceStart: 1,
      chromosome: 2
    }

    var pat5 = {
      data: 'ATCB',
      sequenceStart: 10,
      chromosome: 1
    }

    var pat6 = {
      data: 'AAA',
      sequenceStart: 100,
      chromosome: 1
    }

    it('should return sequence for 2 chromosomes', function() {
      var res = Generator.generateSequence([pat1, pat4]);
      assert(res == '[1:0]CCGGAATT[2:1]CTCTCT');
    })

    it('should concat patterns', function() {
      var res = Generator.generateSequence([pat1, pat2]);
      assert(res == '[1:0]CCGGAATTCGAT');
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
      assert(res == '[1:8]CGATCB');
    })

    it('should filled empty spaces with random data', function() {
      var res = Generator.generateSequence([pat1, pat6]);
      assert(res.substr(-3) == 'AAA');
      assert(res.substr(0,13) == '[1:0]CCGGAATT');
      assert(res.length == 108);
    })

  })

  describe('#createSample', function(){
    this.timeout(600000);
    it('should create correct sample', function(done){
      this.timeout = 600000;
      Generator.createSample('client', [31,32], function(err){
        if (err)
          throw new Error();
        done();
      });
    })
  })
})
