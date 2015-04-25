module.exports = function(sequenceLength, patternsLength) {
  var sampleSequence = '';
  var patterns = [];

  var Pattern = function(start,end,data,chrosomome){
    this.sequenceStart=start;
    this.sequenceEnd= end;
    this.data= data;
    this.chromosome= chrosomome;
    this.correct= false;
  };

  var getRandomDNAstring = function(length) {
    var res = '';
    for(var i=0;i<length;i++) {
      var options = ['c', 'g', 't', 'a'];
      for (var i=0; i<sequenceLength; i++){
        res += options[Math.floor((Math.random()*4))];
      }
    }
    return res;
  }

  (function(){
    sampleSequence = getRandomDNAstring(sequenceLength);
  });

  return {
    getSequence: function() {
      return sampleSequence;
    }
  }
}