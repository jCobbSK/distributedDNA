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

      //read file
      fs.readFile(temporaryFile, {encoding: 'utf-8'}, function(err, data){
        if (err) {
          res.sendStatus(401);
          return;
        }
        //perform transformation of data string
        data = data.toUpperCase();
        data = data.trim();

        //save transformed file into normalized path with normalized encoding
        fs.writeFile(newPath, data, {encoding: 'ASCII'}, function(err){
          if (err) {
            res.sendStatus(401);
            return;
          }

          sample.dataPath = newPath;
          sample.save().then(function(sample){
            global.applicationLogic.analyzeSample(sample);
            res.redirect('/results');
          });
        });
      });
    })
    .catch(function(err){
      res.sendStatus(401);
      return;
    });
});

module.exports = router;
