var JDSM = require('../JDSM/client')('http://localhost:3000');
module.exports = (function() {
  console.log('registering task');
  JDSM.registerTask('pong', function(data, respond) {
    console.log('Data from server', data);
    console.log('Responding to server...');
    respond.respond('pipik');
  })
})()
