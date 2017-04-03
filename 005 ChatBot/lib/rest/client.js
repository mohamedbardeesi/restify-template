/**

 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A class for connecting to services via REST.
 @author Stephen Lombard <yourapiexpert@gmail.com>
 @version 1.0.0
 @module rest
*/

'use strict';
// The Essentials
// These are libraries that the program depends upon to
// function.  You will find them listed in package.json and
// are installed by using 'npm'
var path = require('path'); // Library to work with file paths
var fs = require('fs'); // File system utilities
var util = require('util'); // A collection of handy functions
var EventEmitter = require('events').EventEmitter; // Emits events to listeners
var assert = require('assert-plus'); // Takes care of assertions
var async = require('async');  // Asynchronous processing
var unirest = require('unirest'); // REST client library
var shallowCopy = require('../utils').shallowCopy;
// Local Functions
// Checks to ensure that a JSON string is parsable
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


// The Code
/**
 * creates a REST client connection.
 * @public
 * @function Client
 * @param    {Object} options an options object
 * @returns  {Client}
 */
function Client(options) {

    assert.object(options, 'options');
    EventEmitter.call(this);

    var self = this;
    return this;

}


/**
 * POSTs a request to an HTTP endpoint
 *
 * @public
 * @function post
 * @param   {String} url The url with which to target the request
 * @param   {Object} payload A buffer object containing the payload data
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function post(url, payload, options, callback) {
var self = this;

  // Create the rest object
  var rest = unirest.post(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // SSL
  rest.strictSSL(options.strictSSL);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query); 

  // Request Body
  rest.send(payload)

  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};

/**
 * PUTs a request to an HTTP endpoint
 *
 * @public
 * @function put
 * @param   {String} url The url with which to target the request
 * @param   {Object} payload A buffer object containing the payload data
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function put(url, payload, options, callback) {
var self = this;

  // Create the rest object
  var rest = unirest.put(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query);

   // SSL
  rest.strictSSL(options.strictSSL);

 // Request Body
  rest.send(payload)

  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};



/**
 * GETs a request to an HTTP endpoint
 *
 * @public
 * @function get
 * @param   {String} url The url with which to target the request
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function get(url, options, callback) {
var self = this;
  // Create the rest object
  var rest = unirest.get(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }

  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // SSL
  rest.strictSSL(options.strictSSL);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query);


  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};

/**
 * PATCHs a request to an HTTP endpoint
 *
 * @public
 * @function patch
 * @param   {String} url The url with which to target the request
 * @param   {Object} payload A buffer object containing the payload data
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function patch(url, payload, options, callback) {
var self = this;

  // Create the rest object
  var rest = unirest.patch(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query);

  // SSL
  rest.strictSSL(options.strictSSL);

  // Request Body
  rest.send(payload)

  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};

/**
 * MERGEs a request to an HTTP endpoint
 *
 * @public
 * @function merge
 * @param   {String} url The url with which to target the request
 * @param   {Object} payload A buffer object containing the payload data
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function merge(url, payload, options, callback) {
var self = this;

  // Create the rest object
  var rest = unirest.merge(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query);

  // SSL
  rest.strictSSL(options.strictSSL);

  // Request Body
  rest.send(payload)

  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};


/**
 * DELETEs a request to an HTTP endpoint
 *
 * @public
 * @function delete
 * @param   {String} url The url with which to target the request
 * @param   {Object} payload A buffer object containing the payload data
 * @param   {Object} options The request options/properties to apply
 * @callback {Callback} A callback containing (error, result) objects
 */

function del(url, payload, options, callback) {
var self = this;

  // Create the rest object
  var rest = unirest.delete(url);

  // Headers, including AUTH
  var headers = {};
  if (options.headers) {
   headers = shallowCopy(options.headers || {});
  }
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  rest.headers(headers);

  // Query parameters
  var query = {};
  if (options.query) {
   query = shallowCopy(options.query || {});
  }
  rest.query(query);

  // SSL
  rest.strictSSL(options.strictSSL);

  // Request Body
  rest.send(payload)

  // Execute Request
  rest.end(function (response) {
    if (response.error) {
      return callback(true,response);
    } else {
      return callback(null, response);
    }
  });

};


util.inherits(Client, EventEmitter);

module.exports = {
   get:get,
   post:post,
   put:put,
   patch:patch,
   merge:merge,
   delete:del
}
