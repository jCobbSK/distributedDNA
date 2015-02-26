var express = require('express');
var models = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  models.User.create({
    username: 'penis'
  }).then(function(instance){
    res.send('something');
  })
});

module.exports = router;
