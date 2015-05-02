var express = require('express'),
    models = require('../models'),
    auth = require('../custom/authentification'),
    router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['node']), function(req, res) {
  res.render('computing', { user: req.user });
});

module.exports = router;
