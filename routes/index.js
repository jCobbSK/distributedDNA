var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  //TODO if user is logged, render results or computeStart base on user's role, if he isn't logged, render index page
  if (!req.user) {
    res.render('index', { user: null });
    return;
  }

  if (req.user.username == 'admin') {
    res.redirect('/admin');
    return;
  }

  if (req.user.isClient)
    res.redirect('/results');
  else
    res.redirect('/computeStart');
});

router.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/'
  })
);

router.get('/logout', function(req, res) {
  var name = req.user.username;
  console.log('LOGGING OUT '+ name);
  req.logout();
  res.redirect('/');
})

module.exports = router;
