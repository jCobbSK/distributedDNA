var express = require('express');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['node']), function(req, res) {
  res.render('computing', { user: req.user });
});

module.exports = router;
