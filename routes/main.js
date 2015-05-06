var express = require('express'),
    auth = require('../custom/authentification'),
    router = express.Router(),
    Generator = require('../custom/generator');

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
  console.log('Generating sample', req.user.username);
  Generator.generateRandomSamples(req.user.username, 1, 10, function(){
    res.redirect('/results');
  });
});

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
