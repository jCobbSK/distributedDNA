var express = require('express');
var auth = require('../custom/authentification');
var router = express.Router();

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

router.post('/login',
  auth.authenticate()
);

router.get('/logout', function(req, res) {
  var name = req.user.username;
  console.log('LOGGING OUT '+ name);
  req.logout();
  res.redirect('/');
});

router.get('/register', function(req,res) {
  res.render('register');
});

module.exports = router;
