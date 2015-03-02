var express = require('express');
var moment = require('moment');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['admin']),function(req, res) {
  models.User.findAll().then(function(result){
    res.render('admin', {user: req.user,users: result, moment: moment});
  });
});

module.exports = router;