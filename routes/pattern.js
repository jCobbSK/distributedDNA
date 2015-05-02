var express = require('express'),
    models = require('../models'),
    router = express.Router();

/* GET patterns listing without actual data. */
router.get('/', function(req, res) {
  models.Pattern.findAll({
    attributes: ['name', 'description', 'chromosome', 'sequenceStart', 'sequenceEnd', 'isForwardStrand']
  }).then(function(results){
    res.json(results);
  }).catch(function(err){

  });
});

/* GET all data of specific pattern */
router.get('/:id', function(req, res){
  models.Pattern.find(req.params.id)
    .then(function(pattern){
      res.json(pattern);
    })
    .catch(function(){
      res.statusCode(404);
      res.end();
    });
});

module.exports = router;
