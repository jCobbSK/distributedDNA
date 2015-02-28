var express = require('express');
var moment = require('moment');
var models = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  models.User.findAll().then(function(result){
    res.render('admin', {title: 'Diplomka',users: result, moment: moment});
  });
});

module.exports = router;