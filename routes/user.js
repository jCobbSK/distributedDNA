var express = require('express'),
    models = require('../models'),
    auth = require('../custom/authentification'),
    router = express.Router();

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

/**
 * User can register itself but only as a role of node.
 */
router.post('/register', function(req, res){
  var params = req.body;
  if (!params.username || !params.password || !params.email) {
    res.sendStatus(400);
  }
  models.User.build({
    username: params.username,
    password: params.password,
    isClient: false,
    email: params.email
  }).save().then(function(){
    res.sendStatus(201);
  }).catch(function(){
    res.sendStatus(500);
  })
})

module.exports = router;
