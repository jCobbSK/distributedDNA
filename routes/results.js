var express = require('express');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();
var async = require('async');

router.get('/',auth.roleAuthenticate(['client']), function(req, res) {
  //we find newest sample and redirect to it, if not found any, render empty view
  models.Sample.findAll({
    attributes: ['id'],
    where: {UserId:req.user.id},
    order: [['createdAt', 'DESC']],
    limit: 1
  }).then(function(sample){
    if (sample[0].id)
      res.redirect('/results/'+sample[0].id);
    else {
      res.render('noResults');
    }
  }).catch(function(err){
    res.sendStatus(404);
  });
});



router.get('/:id', auth.roleAuthenticate(['client']), function(req, res) {

  async.parallel([
    function(callback){
      models.Sample.find(req.params.id)
        .then(function(sample){
          if (sample.UserId != req.user.id)
            callback(401, null);
          else {
            callback(null, {sample:sample});
          }
        })
        .catch(function(){
          callback(404, null);
        });
    },
    function(callback){
      models.Sample.findAll({
        attributes: ['id'],
        where: {UserId: req.user.id},
        order: [
          ['createdAt', 'DESC']
        ]
      })
        .then(function(samples){
          callback(null, {samples:samples});
        })
        .catch(function(){
          callback(404, null);
        });
    }
  ],function(err, results){
    if (err) {
      res.sendStatus(err);
    }

    //results is array of object we have to merge them into one object
    var result = {};
    for (var i in results) {
      for (var k in results[i])
        result[k] = results[i][k];
    }
    result['actualSample'] = req.params.id;
    res.render('results', result);
  });
});

router.get('/:id/download', function(req, res) {

  models.Sample.find(req.params.id)
    .then(function(sample){
      if (sample.UserId != req.user.id) {
        res.sendStatus(401);
      } else {
        var file = appRoot + '/samples/'+sample.dataPath;
        res.download('../samples/'+sample.dataPath);
      }
    })
});



module.exports = router;
