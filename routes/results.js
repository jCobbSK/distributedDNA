var express = require('express'),
    models = require('../models'),
    auth = require('../custom/authentification'),
    router = express.Router(),
    Q = require('q');

router.get('/',auth.roleAuthenticate(['client']), function(req, res) {
  //we find newest sample and redirect to it, if not found any, render empty view
  models.Sample.findAll({
    attributes: ['id'],
    where: {UserId:req.user.id},
    order: [['createdAt', 'DESC']],
    limit: 1
  }).then(function(sample){
    if (!sample || sample.length == 0) {
      res.render('noResults');
      return;
    }

    if (sample[0].id)
      res.redirect('/results/'+sample[0].id);

  }).catch(function(err){
    console.log(err);
    res.sendStatus(404);
  });
});



router.get('/:id', auth.roleAuthenticate(['client']), function(req, res) {
  Q.all([
    models.Sample.find({
      where: {id:req.params.id},
      include: [
        {model:models.Result, as: 'Results', include: [
          {model: models.Pattern}
        ]}
      ]
    }),
    models.Sample.findAll({
      attributes: ['id','isDone'],
      where: {UserId: req.user.id},
      order: [
        ['isDone', 'ASC'],
        ['createdAt', 'DESC']
      ]
    })
  ]).then(function(results){
    var sample = results[0];
    var samples = results[1];
    var result = {};
    if (sample.UserId != req.user.id)
      res.sendStatus(401);
    else
      result['sample'] = sample;

    result['sample']['Results'] = result['sample']['Results'].sort(function(a, b){
      if (a.result && !b.result)
        return -1;
      else if (!a.result && b.result)
        return 1;
      else
        return a.Pattern.id - b.Pattern.id;
    });
    result['samples'] = samples;
    result['actualSample'] = req.params.id;
    res.render('results', result);
  }).catch(function(err){
    res.sendStatus(404);
  });
});

router.get('/:id/download', function(req, res) {

  models.Sample.find(req.params.id)
    .then(function(sample){
      if (sample.UserId != req.user.id) {
        res.sendStatus(401);
      } else {
        res.download(sample.dataPath);
      }
    })
});



module.exports = router;
