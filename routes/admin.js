var express = require('express');
var moment = require('moment');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['admin']),function(req, res) {
  var respond = {
    user: req.user,
    moment: moment
  };
  models.User.findAll().then(function(result){
    respond.users = result;
    if (respond.patterns) {
      res.render('admin', respond);
    }
  });

  models.Pattern.findAll().then(function(result){
    respond.patterns = result;
    if (respond.users) {
      res.render('admin', respond);
    }
  });
});

module.exports = router;