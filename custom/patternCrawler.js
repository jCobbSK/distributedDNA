/**
 * Class for crawling ensembl genome browser for fetching and persisting patterns.
 * It is used in grunt task fetchEnsemblData.
 * @class PatternCrawler
 * @module Custom
 */
var http = require('http');
var util = require('util');
var models = require('../models');
var mysql = require('mysql');
var colors = require('colors');
module.exports = {

  /**
   * Remove all database entries of patterns
   * @method clearAll
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
   * @method savePattern
   * @param {Object} data
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
      callback();
    }).catch(function(err){
      console.log(err);
    })
  },

  /**
   * Crawling ensembl genome browser and copying gene patterns into localhost database.
   *
   * It is optimize for crawling ensembl.org @ 2.3.2015
   * @method crawl
   * @param {integer} numberOfPatterns - number of patterns to fetch, if null ALL patterns are fetched
   * @param {function} callback - callback called after finished callback(err, result)
   */
  crawl: function(numberOfPatterns, callback) {
    var connection = mysql.createConnection({
      host: 'ensembldb.ensembl.org',
      user: 'anonymous'
    });

    var scheme = 'homo_sapiens_core_78_38.gene';
    var query = util.format('SELECT * FROM %s WHERE %s = %s AND %s = %s LIMIT %s;',
                  scheme,
                  scheme+'.biotype',
                  "\'protein_coding\'",
                  scheme+'.status',
                  "\'KNOWN\'",
                  (numberOfPatterns)?numberOfPatterns:'ALL');
    var self = this;
    var temporaryObjects = {};
    connection.query(query, function(err, rows, fields){
      if (err) {
        throw err;
      }
      var rowsLeft = rows.length;
      var counter = 0;
      for (var i in rows) {
        counter++;
        setTimeout(function(rowObj){
          console.log('Calling function'.red, Date.now());
          //ensembl allows only 15 requests per second -> need to put sleep
          var path = 'http://rest.ensembl.org/sequence/id/'+rowObj.stable_id+'?content-type=application/json';
          temporaryObjects[rowObj.stable_id] = {
            name: rowObj.stable_id,
            description: rowObj.description,
            isForwardStrand: rowObj.seq_region_strand == 1
          };

          http.get(path, function(result){
            var data = '';
            result.on('data', function(chunk){
              data += chunk;
            });
            result.on('end', function(){
              try {
                data = JSON.parse(data);
              }catch(err) {
                console.log(data);
                throw err;
              }
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
                if (--rowsLeft == 0)
                  callback(null, true);
              });
            });
          }).on('error', function(e){
            console.log('REQ ERROR: '+ e.message);
            callback(true, null);
          });
        }, counter*(1000/14), rows[i]);

      }


    });

    connection.end();
  }
};