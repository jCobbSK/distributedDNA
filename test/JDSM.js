var assert = require("assert"),
    _ = require('underscore');
describe('JDSM', function(){
  var request = require('../JDSM/request');
  describe('Request', function() {

    describe('#constructor', function(){

      it('should set default values without provided options', function () {
        var pp = [1,2,3];
        var res = _.find(pp, function(obj){
          if (obj == 3)
            return true;
          return false;
        })
      })
    })
  })
})
