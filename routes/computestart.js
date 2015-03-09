var express = require('express');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['node']), function(req, res) {
  models.User.find(req.user.id)
    .then(function(user) {
      res.render('computestart', {
        computedTimeHours: user.computedTime / 60,
        computedTimeMinutes: user.computedTime % 60
      })
    })
    .catch(function(err){
      res.sendStatus(404);
    });
});

module.exports = router;
