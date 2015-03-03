var http = require('http');
var util = require('util');
var models = require('../models');
var mysql = require('mysql');
module.exports = {

  /**
   * Remove all database entries of patterns
   */
  clearAll: function(){
    models.Pattern.findAll().then(function(patterns){
      for (var i= 0, len=patterns.length; i<len;i++) {
        patterns[i].destroy().then(function(){
          console.log('destroyed pattern');
        });
      }
    });
  },

  /**
   * Saving pattern to database, data attributes are name, description, data, chromosome, isForwardStrand
   * @param data
   */
  savePattern: function(data, callback) {
    var pattern = models.Pattern.create({
      name: data.name,
      description: data.description,
      data: data.data,
      chromosome: data.chromosome,
      isForwardStrand: data.isForwardStrand,
      sequenceStart: data.sequenceStart,
      sequenceEnd: data.sequenceEnd
    }).then(function(pattern){
      console.log('Create pattern #'+pattern.id);
      callback();
    });
  },

  /**
   * Actual application logic.
   *
   * It is optimize for crawling ensembl.org @ 2.3.2015
   */
  crawl: function() {
    var connection = mysql.createConnection({
      host: 'ensembldb.ensembl.org',
      user: 'anonymous'
    });

    var scheme = 'homo_sapiens_core_78_38.gene';
    var query = util.format('SELECT * FROM %s WHERE %s = %s AND %s = %s LIMIT 5;',
                  scheme,
                  scheme+'.biotype',
                  "\'protein_coding\'",
                  scheme+'.status',
                  "\'KNOWN\'");
    var self = this;
    var temporaryObjects = {};
    connection.query(query, function(err, rows, fields){
      if (err) {
        throw err;
      }

      for (var i in rows) {
        var path = 'http://rest.ensembl.org/sequence/id/'+rows[i].stable_id+'?content-type=application/json';
        console.log(path);
        temporaryObjects[rows[i].stable_id] = {
          name: rows[i].stable_id,
          description: rows[i].description,
          isForwardStrand: rows[i].seq_region_strand == 1
        };

        http.get(path, function(result){
           var data = '';
           result.on('data', function(chunk){
             data += chunk;
           });
           result.on('end', function(){
             data = JSON.parse(data);
             temporaryObjects[data.id]['data'] = data.seq;
             //parse from data.desc, chromosome number and position from:to
             //e.q chromosome:GRCh38:CHR_HSCHR6_MHC_COX_CTG1:29552212:29556525:-1
             var parts = data.desc.split(':');
             temporaryObjects[data.id]['sequenceStart'] = parts[parts.length - 3];
             temporaryObjects[data.id]['sequenceEnd'] = parts[parts.length - 2];
             var chromosome = parts[parts.length - 4];
             chromosome = chromosome.substring(chromosome.length - 2, chromosome.length);
             temporaryObjects[data.id]['chromosome'] = isNaN(parseInt(chromosome))?parseInt(chromosome[1]):parseInt(chromosome);
             //save object
             self.savePattern(temporaryObjects[data.id],function(){
               delete temporaryObjects[data.id];
             });
           });
        }).on('error', function(e){
           console.log('REQ ERROR: '+ e.message);
        });
      }


    });

    connection.end();
  }
};