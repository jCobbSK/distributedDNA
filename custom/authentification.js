//custom middleware module for username+password auth with additional roles
var passport = require('passport');
module.exports = {
  authenticate : function() {
    return passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/'
    });
  },

  /**
   * Our role based authentification function
   * @param roles
   * @returns {Function}
   */
  roleAuthenticate: function(roles) {
    return function(req, res, next) {
      var loggedUser = req.user;
      if (!loggedUser) {
        console.log('redirecting loggedUser unknown');
        res.redirect('/');
        return;
      }

      var result = false;
      for (var i= 0, len=roles.length;i<len;i++) {
        switch(roles[i]){
          case 'node':
            if (!loggedUser.isClient)
              result = true;
            break;
          case 'client':
            if (loggedUser.isClient)
              result = true;
            break;
          case 'admin':
            if (loggedUser.isAdmin)
              result = true;
            break;
        }
      }

      if (!result) {
        console.log('redirecting result false', roles, loggedUser.isAdmin,loggedUser.isClient);
        res.redirect('/');
        return;
      }

      next();
    }
  }
}