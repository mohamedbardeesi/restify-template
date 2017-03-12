/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A fun little controller to demonstrate southbound endpoints
 @author YourAPIExpert <yourapiexpert@gmail.com>
 @version 1.0.0
 @module controller/geo
*/

// The Essentials
var maxmind = require('maxmind'); // MaxMind's GeoData
var whois = require('whois-api'); // WHOIS domain lookup
var nslookup = require('nslookup'); // NSLOOKUP-type library

// Some Configuration
var lookup = maxmind.openSync('./db/GeoLite2-City.mmdb', {
  cache: {
    max: 1000, // max items in cache
    maxAge: 1000 * 60 * 60 // life time in milliseconds
  }
});


//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

/** Constructor function
  *
  * @exports controller/Geo.
  * @constructor
  */
var Geo = function() {};

/**
  * Instantiate the class so that we can pass the instance
  * to the caller for use in the routing
  */
var geo = new Geo();

// Controller.
// Here we implement the application logic to deal with the individual routes.

/** Export our route map */
module.exports.route = function(app, passport) {

  /** This protected endpoint makes use of a database to determine the country and city of an IP */
  app.get('/geo/:ip', function(req, res, next) { passport.authenticate('jwt',
    function(err, user, info) {
       if (!user) {
          return res.send(401, {error:{code: 401, status: 'ACCESSDENIED', message: 'Access denied'}});
       } else {
          // Ensure that this is a valid IP address
          if (req.params.ip.match(/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/)) {
             return res.send(200, {success:{code: 200, status: 'SUCCESS', message: 'Success'}, results:lookup.get(req.params.ip)});
          } else {
             return res.send(401, {error:{code: 406, status: 'BADREQUEST', message: 'Invalid IP address'}});
          }
       }
 
    })(req,res,next);
 });

  /** This protected endpoint obtains registrant and contact information for domain names */
  app.get('/whois/:domain', function(req, res, next) { passport.authenticate('jwt',
    function(err, user, info) {
       if (!user) {
          return res.send(401, {error:{code: 401, status: 'ACCESSDENIED', message: 'Access denied'}});
       } else {
          try {
             whois.lookup(req.params.domain, function(err,result) {
               if (err) { res.send(401, {error:{code: 406, status: 'BADREQUEST', message: err }}); }
               return res.send(200, {success:{code: 200, status: 'SUCCESS', message: 'Success'}, results:result});
	     });
          } catch (ex) {
                return res.send(401, {error:{code: 406, status: 'BADREQUEST', message: 'Invalid WHOIS request '}});
          }
       }
 
    })(req,res,next);
 });

  /** This protected endpoint makes use of nslookup to translate domain queries to IP addresses */
  app.get('/lookup/:record/:type', function(req, res, next) { passport.authenticate('jwt',
    function(err, user, info) {
       if (!user) {
          return res.send(401, {error:{code: 401, status: 'ACCESSDENIED', message: 'Access denied'}});
       } else {
          try {
            nslookup(req.params.record)
	      .server('8.8.8.8') // default is 8.8.8.8 
              .type(req.params.type) // default is 'a' 
              .timeout(10 * 1000) // default is 3 * 1000 ms 
              .end(function (err, addrs) {
                   if (err) { res.send(401, {error:{code: 406, status: 'BADREQUEST', message: err }}); }
                   return res.send(200, {success:{code: 200, status: 'SUCCESS', message: 'Success'}, results:addrs});
              });
          } catch (ex) {
                return res.send(401, {error:{code: 406, status: 'BADREQUEST', message: 'Question type must be one of a | ns | mx | cname '}});
          }
       }
 
    })(req,res,next);
 });


};



