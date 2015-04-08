var express = require('express');
var models = require('../models');
var auth = require('../custom/authentification');
var router = express.Router();

/* GET users listing. */
router.get('/',auth.roleAuthenticate(['admin']), function(req, res) {
  models.User.findAndCount().then(function(result){
    res.json(result);
  });
});

/* POST create user */
router.post('/', function(req, res) {
  var params = req.body;

  //client can be made only by admin
  if (params.isClient && !req.user.isAdmin){
    res.sendStatus(401);
  }

  var user = models.User.build({
    username: params.username,
    password: params.password,
    isClient: params.isClient,
    email: params.email
  });
  user.save()
    .then(function(user){
      res.send({id:user.id,success:true});
    })
    .catch(function(error){
      res.send({success:false})
    });
});

module.exports = router;
