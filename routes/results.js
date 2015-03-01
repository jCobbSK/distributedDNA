var express = require('express');
var models = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('results', {
    user: req.user,
    sampleId: 132,
    patientName: 'Kubko',
    additionalInfo: 'Blablabla',
    title: 'Penis'
  });
});

module.exports = router;
