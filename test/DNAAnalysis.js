var assert = require('assert');
describe('DNAAnalysisModule', function(){

  describe('Cluster', function() {

    var cluster = require('../DNAAnalysis/cluster');

    describe('#constructor', function(){

      it('should set default options', function() {
        var c = new cluster();
        assert(c.toString()=='Id:-1;Chromosome:-1;SequenceStart:-1;SequenceEnd:-1;PatternsLength:0');
      })

      it('should set constructor options', function(){
        var c = new cluster({
          id:1,
          chromosome:13,
          sequenceStart:1000,
          sequenceEnd:1250
        });
        assert(c.toString()=='Id:1;Chromosome:13;SequenceStart:1000;SequenceEnd:1250;PatternsLength:0');
      })
    })

    describe('#addPattern', function() {

      it('should set correct properties after first pattern', function(){
        var c = new cluster();
        c.addPattern({
          sequenceStart: 123,
          sequenceEnd: 156,
          chromosome: 12
        });

        assert(c.toString()=='Id:-1;Chromosome:12;SequenceStart:123;SequenceEnd:156;PatternsLength:1');
      })

      it('should correctly extend bounds after add pattern', function() {
        var c = new cluster();
        c.addPattern({
          sequenceStart: 123,
          sequenceEnd: 156,
          chromosome: 12
        });
        c.addPattern({
          sequenceStart: 100,
          sequenceEnd: 250,
          chromosome: 12
        });
        assert(c.toString()=='Id:-1;Chromosome:12;SequenceStart:100;SequenceEnd:250;PatternsLength:2');
      })

    })

  })

  describe('ClusterHandler', function(){

    var clusterHandler = require('../DNAAnalysis/clusterHandler');

    describe('#constructor', function(){

      it('should set default constructor options', function(){
        var ch = clusterHandler();
        var opt = ch.getOptions();
        assert(-1 == opt.idealSequenceLength);
      })

      it('should correct set options', function() {
        var ch = clusterHandler({
          idealSequenceLength: 10
        });
        var opt = ch.getOptions();
        assert(10 == opt.idealSequenceLength);
      })

    })

    describe('#addPattern', function(){
      var clusterHandlerInstance;

      beforeEach(function(){
        clusterHandlerInstance = clusterHandler({
          idealSequenceLength: 100
        })
      });

      it('should create 2 separate clusters', function(){
        var pattern1 = {
          sequenceStart: 10,
          sequenceEnd: 25,
          chromosome: 1
        };

        var pattern2 = {
          sequenceStart:30,
          sequenceEnd: 45,
          chromosome: 1
        };

        clusterHandlerInstance.addPattern(pattern1);
        clusterHandlerInstance.addPattern(pattern2);
        var clusters = clusterHandlerInstance.getClusters()[0];
        assert(clusters.length == 2);
        assert(clusters[0].getSequenceStart() == 10);
        assert(clusters[0].getSequenceEnd() == 25);
        assert(clusters[0].getPatterns().length == 1);
        assert(clusters[1].getSequenceStart() == 30);
        assert(clusters[1].getSequenceEnd() == 45);
        assert(clusters[1].getPatterns().length == 1);
      })

      it('should create and extend cluster', function(){
        var pattern1 = {
          sequenceStart: 10,
          sequenceEnd: 25,
          chromosome: 1
        };
        var pattern2 = {
          sequenceStart: 23,
          sequenceEnd: 35,
          chromosome: 1
        };
        clusterHandlerInstance.addPattern(pattern1);
        clusterHandlerInstance.addPattern(pattern2);
        var clusters = clusterHandlerInstance.getClusters()[0];
        assert(clusters.length == 1);
        assert(clusters[0].getSequenceStart() == 10);
        assert(clusters[0].getSequenceEnd() == 35);
        assert(clusters[0].getPatterns().length == 2);
      })

      it('should extend cluster', function(){
        var pattern1 = {
          sequenceStart: 10,
          sequenceEnd: 25,
          chromosome: 1
        };

        var pattern2 = {
          sequenceStart: 5,
          sequenceEnd: 50,
          chromosome: 1
        };

        clusterHandlerInstance.addPattern(pattern1);
        clusterHandlerInstance.addPattern(pattern2);

        var clusters = clusterHandlerInstance.getClusters()[0];
        assert(clusters.length == 1);
        assert(clusters[0].getSequenceStart() == 5);
        assert(clusters[0].getSequenceEnd() == 50);
        assert(clusters[0].getPatterns().length == 2);

      })

      it('should add pattern into cluster', function(){
        var pattern1 = {
          sequenceStart: 10,
          sequenceEnd: 25,
          chromosome: 1
        };

        var pattern2 = {
          sequenceStart: 5,
          sequenceEnd: 50,
          chromosome: 1
        };

        clusterHandlerInstance.addPattern(pattern2);
        clusterHandlerInstance.addPattern(pattern1);

        var clusters = clusterHandlerInstance.getClusters()[0];
        assert(clusters.length == 1);
        assert(clusters[0].getSequenceStart() == 5);
        assert(clusters[0].getSequenceEnd() == 50);
        assert(clusters[0].getPatterns().length == 2);
      })

    })

    describe('#finalizeClustering', function() {

      var clusterHandlerInstance;

      before(function(){
        clusterHandlerInstance = new clusterHandler({
          idealSequenceLength: 100
        });

        clusterHandlerInstance.addPatterns([
          {
            sequenceStart: 1,
            sequenceEnd: 15,
            chromosome: 1
          },
          {
            sequenceStart: 14,
            sequenceEnd: 99,
            chromosome: 1
          },
          {
            sequenceStart: 98,
            sequenceEnd: 105,
            chromosome: 1
          },
          {
            sequenceStart: 110,
            sequenceEnd: 120,
            chromosome: 1
          }
        ]);

        clusterHandlerInstance.finalizeClustering();
        assert(clusterHandlerInstance.getClusters()[0].length == 3);
      })

      it('should merge clusters if collides and together have good length', function() {
        var cluster = clusterHandlerInstance.getClusters()[0][0];
        assert(cluster.getSequenceStart() == 1);
        assert(cluster.getSequenceEnd() == 99);
      })

      it('should NOT merge clusters if not collides', function(){
        var cluster = clusterHandlerInstance.getClusters()[0][2];
        assert(cluster.getSequenceStart() == 110);
        assert(cluster.getSequenceEnd() == 120);
      })

      it('should NOT merge clusters if together exceeds ideal length of cluster', function(){
        var cluster = clusterHandlerInstance.getClusters()[0][1];
        assert(cluster.getSequenceStart() == 98);
        assert(cluster.getSequenceEnd() == 105);
      })
    })

  })

  describe('SampleReader', function(){

    var SampleReader = require('../DNAAnalysis/sampleReader');

    it('should add chunk of data to sequence', function() {
      var sr = new SampleReader();
      sr.addChunk('Hello');
      sr.addChunk(' World!');
      assert(sr.getSequence() === 'Hello World!');
    })

    it('should trim begin and update startIndex', function() {
      var sr = new SampleReader();
      var myCustomString = 'Hello World of NodeJS. Glad to be here';
      sr.addChunk(myCustomString);
      assert(sr.getStartIndex() == 0);
      assert(sr.getEndIndex() == myCustomString.length);
      sr.trimBeginToIndex(4);
      assert(sr.getStartIndex() == 4);
      assert(sr.getEndIndex() == myCustomString.length);
    })

    it('should return correct substring based on indexes', function() {
      var sr = new SampleReader();
      var myCustomString = 'Hello World of NodeJS. Glad to be here';
      sr.addChunk(myCustomString);
      assert(sr.getStartIndex() == 0);
      assert(sr.getEndIndex() == myCustomString.length);
      sr.trimBeginToIndex(4);
      assert(sr.getStartIndex() == 4);
      assert(sr.getEndIndex() == myCustomString.length);
      assert(sr.getPartOfSequence(5,10) == myCustomString.substring(5,10));
    })

    it('should correctly parse sample format with multiple portions', function(){
      var sample1chunk = '[1]aaabccddd[2]abcdefghij[13:100]aaaabbbb[4]';
      var sample2chunk = 'aabd[1:100]bcde';
      var result = '';
      var sr = new SampleReader();
      var handlerEnd = function(sequence, chromosome, startIndex) {
        result += '['+chromosome+':'+startIndex+']'+sequence;
      }
      sr.addChunk(sample1chunk, handlerEnd);
      sr.addChunk(sample2chunk, handlerEnd);
      assert(result == '[1:0]aaabccddd[2:0]abcdefghij[13:100]aaaabbbb[4:0]aabd');
      assert(sr.getSequence() == 'bcde');
      assert(sr.getStartIndex() == 100);
    })
  })

})