var express = require('express');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['client']), function(req, res) {
  res.render('results', {
    user: req.user,
    samples: [
      {id: 123,
       patientName: 'Kubko',
       additionalInfo: 'bLABLA',
       isDone: false,
       results: [
         {
           id: 1,
           name: 'GENE-321',
           description: 'Breast cancer',
           result: false
         }
       ]
      }
    ],
    sampleId: 132,
    patientName: 'Kubko',
    additionalInfo: 'Blablabla'
  });
});

module.exports = router;
