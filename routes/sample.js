var express = require('express'),
    fs = require('fs'),
    models = require('../models'),
    auth = require('../custom/authentification'),
    router = express.Router();

/* GET samples of logged user. */
router.get('/',auth.roleAuthenticate(['client']), function(req, res) {
  var userId = req.user.id;
  models.Sample.findAll({where: {UserId:userId}})
    .then(function(samples){
      res.json(samples);
    });
});

/* POST create sample */
router.post('/',auth.roleAuthenticate(['client']), function(req, res) {
  var userId = req.user.id;
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
          sample.save().then(function(sample){
            //start analyzing sample
            global.applicationLogic.analyzeSample(sample);
            res.redirect('/results');
          });
        }
      });
    })
    .catch(function(err){

    });
});

module.exports = router;
