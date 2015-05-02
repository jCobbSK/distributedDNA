var express = require('express'),
    models = require('../models'),
    auth = require('../custom/authentification'),
    router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['client']), function(req, res) {
  res.render('settask', { user: req.user });
});

module.exports = router;
