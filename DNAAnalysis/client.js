var JDSM = require('../JDSM/client')('http://localhost:3000');
module.exports = (function() {
  console.log('registering tasks');

  JDSM.registerTask('analyze', function(data, respond){

  })

  JDSM.registerTask('analyzeNoCache', function(data, respond){

  })

  JDSM.registerTask('addClusters', function(data, respond){

  })

  JDSM.registerTask('freeClusters', function(data, respond){

  })
})()
