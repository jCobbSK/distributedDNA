var Generator = require('../custom/generator'),
    assert = require('assert'),
    fs = require('fs');

describe('Generator of samples', function(){
  describe('#generateSequence', function(){

    var testPath = 'test.txt';

    /**
     * Compare content of file with result string.
     * @method testFile3
     * @param {string} result
     * @returns {boolean}
     */
    var testFile = function(result) {
      var fileContent = fs.readFileSync(testPath, {encoding: 'utf-8'});
      return fileContent == result;
    }

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



    it('should return sequence for 2 chromosomes', function(done) {
      Generator.generateSequence([pat1, pat4], [], testPath, function(err){
        if (!err && testFile('[1:0]CCGGAATT[2:1]CTCTCT'))
          done();
        else
          throw new Error();
      });
    })

    it('should concat patterns', function() {
      Generator.generateSequence([pat1, pat2], [], testPath, function(err){
        if (!err && testFile('[1:0]CCGGAATTCGAT'))
          done();
        else {
          throw new Error();
        }
      });
    })

    it('should throw error of colliding patterns', function(done) {
      Generator.generateSequence([pat2, pat3], [], testPath, function(err){
         if (err)
          done();
         else
          throw err;
      });
    })

    it('shouldn\'t throw error of colliding patterns', function(done) {
      Generator.generateSequence([pat2, pat5], [], testPath, function(err){
        if (!err && testFile('[1:8]CGATCB'))
          done();
        else
          throw new Error();
      });
    })

    /**
     * After all test scenarios, remove helper file.
     */
    after(function(done){
      fs.exists(testPath, function(exists){
        if (exists)
          fs.unlinkSync(testPath);
        done();
      })
    })
  })
})
