var express = require('express');
var fs = require('fs');
var models = require('../models');
var router = express.Router();

/* GET samples of logged user. */
router.get('/', function(req, res) {
  var userId = 1; //TODO get actual logged user id
  models.Sample.findAll({where: {UserId:userId}})
    .then(function(samples){
      res.json(samples);
    });
});

/* POST create sample */
router.post('/', function(req, res) {
  var userId = 1; //TODO get actual logged user id
  var sample = models.Sample.build({
    patientName: req.body.patientName,
    additionalInfo: req.body.additionalInfo,
    UserId: userId
  });
  var temporaryFile = req.files.sampleFile.path;
  //need to save sample to get id
  sample.save()
    .then(function(sample){
      var newPath = './samples/'+userId+'_'+sample.id+'.dna';

      //TODO INSTEAD BLINDLY RENAME we should process the data so it is stored with correct syntax and
      //encoding etc. etc.
      fs.rename(temporaryFile, newPath, function(err){
        if (err)
          console.log(err);
        else {
          sample.dataPath = newPath;
          sample.save().then(function(){
            res.redirect('/results');
          });
        }
      });
    })
    .catch(function(err){

    });
});

module.exports = router;
