'use strict';

var request = require('request'),
    models = require('./models'),
    async = require('async'),
    crawler = require('./custom/patternCrawler'),
    Generator = require('./custom/generator');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  //task for generating client side JDSM module
  grunt.loadNpmTasks('grunt-browserify');

  //task for generating documentation
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'bin/www'
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/style.css': 'public/css/style.scss'
        }
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'bin/www',
          'app.js',
          'routes/*.js',
          'custom/*.js',
          'models/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: [
          'public/css/*.scss'
        ],
        tasks: ['sass'],
        options: {
          livereload: reloadPort
        }
      },
      views: {
        files: ['views/*.ejs'],
        options: {
          livereload: reloadPort
        }
      },

      /**
       * Automatic compile client side modules into front-end javascript file which
       * can be included into page
       */
      clientSide: {
        files: ['DNAAnalysis/client.js', 'JDSM/client.js'],
        tasks: ['browserify'],
        options: {
          livereload: reloadPort
        }
      }
    },

    browserify: {
      main: {
        src: 'DNAAnalysis/client.js',
        dest: 'public/components/JDSM/index.js'
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: ['JDSM/', 'DNAAnalysis/'],
          outdir: 'Documentation'
        }
      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', [
    'sass',
    'develop',
    'browserify',
    'watch'
  ]);

  /**
   * Grunt task for creating default accounts
   */
  grunt.registerTask('createData', 'Create default accounts', function(){

    //set grunt task as async -> finished after call done();
    var done = this.async();

    var createUser = function(username, password, isClient, isAdmin, email) {
      return function(callback){
        models.User.create({
          username: username,
          password: password,
          isClient: isClient,
          isAdmin: isAdmin,
          email: email
        }).then(function(user){
          callback(null, user);
        }).catch(function(err){
          callback(err, null);
        });
      }
    }

    //async module deals with handling multiple parallel async tasks
    async.parallel([
      //admin account
      createUser('admin', 'admin', true, true, 'admin@admin.com'),
      //clients
      createUser('client', 'client', true, false, 'client@clients.com'),
      createUser('client1', 'client1', true, false, 'client1@clients.com'),
      createUser('client2', 'client2', true, false, 'client2@clients.com'),
      //nodes
      createUser('node', 'node', false, false, 'node@nodes.com'),
      createUser('node1', 'node1', false, false, 'node1@nodes.com'),
      createUser('node2', 'node2', false, false, 'node2@nodes.com'),
    ], function(err, results){
      if (err)
        console.error('Error during creation');
      else
        console.log('Done!');
      //finally end grunt task
      done();
    });

  });

  /**
   * Remove all data from table provided in param
   */
  grunt.registerTask('purgeData', 'Deleting IRREVERSABLE all data from selected table', function(tableName){
    var done = this.async();
    models[tableName].findAll()
      .then(function(rows){
        if (rows.length == 0)
          done();

        var destroyedRows = 0;
        for (var i= 0,len = rows.length;i<len;i++) {
          rows[i].destroy()
            .then(function(){
              destroyedRows++;
              if (destroyedRows == len)
                done();
            })
            .catch(function(){
              console.log('Error deleting row');
              done();
            });
        }
      })
      .catch(function(err){
        console.log('Error finding table');
        done();
      });
  });

  /**
   * Grunt task for populate pattern table from ensembl genome browser. Function is provided from patternCrawler.js
   */
  grunt.registerTask('fetchEnsemblData', 'Crawl and persist pattern data from ensembl genome browser', function(){
    var done = this.async();
    crawler.crawl(function(err, result){
      if (err)
        console.error('something went wrong');
      else
        console.log('Fetching is complete!')
      done();
    });
  });

  /**
   * Grunt task for creating sample for provided pattern ids and user defined by username
   * e.q grunt generateSample:client:[32,33]
   */
  grunt.registerTask('generateSample', 'Create sample record with correct dna file for selected patterns', function(username, patternIds){
    console.log('Generating samples... This may take a few minutes.');
    //async task
    var done = this.async();
    var patternIds = JSON.parse(patternIds);
    Generator.createSample(username, patternIds, function(err){
      if (!err) {
        console.log('Sample generated!');
        done();
        return;
      }

      console.error('Some ERROR!');
      done();
    });
  });
};
