var express = require('express');
var models = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('computing', { title: 'Express' });
});

module.exports = router;
