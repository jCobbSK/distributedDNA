/**
 *
 * @param options
 * @module JDSM
 */
var _ = require('underscore');

module.exports = function(options) {
  if (!options)
    options = {};

  /**
   * Unique id of masterRequest
   * @type {number}
   */
  var id = options['id'] || -1;

  /**
   * Type of request, possible values: 'async', 'sync'
   * @default 'async'
   * @type {string}
   */
  var type = options['type'] || 'async';

  /**
   * @type {Array of Request objects}
   */
  var dependentRequests = options['dependentRequests'] || [];

  /**
   * Callback function called after all dependentRequests are handled, based on type.
   * @type {function}
   */
  var callback = options['callback'] || null;

  /**
   * During synchronous request, if the response from some of the dependentRequests request is
   * passed into next request, and after the last one is resolved, callback is called.
   * @param {Request object} request
   */
  var handleSync = function(request) {
    //find first not resolved request and start it with prerequisites
    var nextRequest = _.find(dependentRequests, function(req){
      return !req.getResponse();
    });

    //if next request doesn't exist -> all requests are resolved -> call callback
    if (!nextRequest) {
      callback(null, request.getResponse());
    } else {
      nextRequest.run(null, request.getResponse());
    }
  }

  /**
   * During asynchronous request, callback is called after all dependent requests are resolved.
   * @param {Request object} request
   */
  var handleAsync = function(request) {
    var notResolved = _.find(dependentRequests, function(req){
      return !req.getResponse();
    });

    if (notResolved) {
      //some request is not resolved -> waiting for finish it
      return;
    }

    //all requests are resolved -> calling callback, but results are only responses, not internal
    //properties of requests so we need to transform them
    var transformed = _.map(dependentRequests, function(request){
      return request.getResponse();
    });

    if (callback)
      callback(null, transformed);
  }

  return {
    /**
     * Handling response of child requests.
     * @param request
     */
    handleResponse: function(request) {
      switch(type) {
        case 'sync':
          handleSync(request);
          break;
        case 'async':
          handleAsync(request);
          break;
        default:
          throw new Error('Not valid type property');
      }
    },

    /**
     * Start request (send requests to nodes)
     * @param {function} [optional] callback overrided callback from constructor
     */
    run: function(_callback) {
      callback = _callback;

      switch(type){
        case 'async':
          //run all dependent requests
          _.each(dependentRequests, function(req){
            req.run();
          });
          break;
        case 'sync':
          //run first dependent request
          _.first(dependentRequests).run();
          break;
      }
    },

    getId: function() {
      return id;
    },

    setDependentRequests: function(requests) {
      dependentRequests = requests;
    }
  }
}