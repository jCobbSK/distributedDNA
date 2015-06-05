var express = require('express'),
    auth = require('../custom/authentification'),
    router = express.Router(),
    Generator = require('../custom/generator'),
    colors = require('colors');

/* GET home page. */

router.get('/', function(req, res) {
  if (!req.user) {
    res.render('index', { user: null });
    return;
  }

  if (req.user.isAdmin) {
    res.redirect('/admin');
    return;
  }

  if (req.user.isClient)
    res.redirect('/results');
  else
    res.redirect('/computeStart');
});

router.get('/generateSample',auth.roleAuthenticate(['client']), function(req, res) {
  Generator.generateRandomSamples(req.user.username, 1, 10, function(err, samples){
    if (samples && samples[0])
      global.applicationLogic.analyzeSample(samples[0]);
    res.redirect('/results');
  });
});

router.get('/getresults', auth.roleAuthenticate(['client']), function(req, res) {
  res.json(global.UsersStorage.needRefresh(req.user.id));
})

router.post('/login',
  auth.authenticate()
);

router.get('/register', function(req, res){
  res.render('register');
})

router.get('/logout', function(req, res) {
  var name = req.user.username;
  console.log('LOGGING OUT '+ name);
  req.logout();
  res.redirect('/');
});

module.exports = router;
