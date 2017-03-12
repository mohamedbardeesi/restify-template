/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A basic authentication controller demonstrating JWT authorization.
 @author YourAPIExpert <yourapiexpert@gmail.com>
 @version 1.0.0
 @module controller/auth
*/

// The Essentials
var jwt = require('jsonwebtoken'); // Jason Web Tokens
var config = require('config'); // Easy configuration file parser
var crypto = require('crypto'); // Cryptographic library

// Configuration
var jwtConfig = config.get('jwt');


//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

/** Constructor function
  *
  * @exports controller/User.
  * @constructor
  */
var Auth = function() {};

/**
  * Instantiate the class so that we can pass the instance
  * to the caller for use in the routing
  */
var auth = new Auth();

// Controller.
// Here we implement the application logic to deal with the individual routes.

/** getToken()
 * The passport library we included earlier has automatically extracted the
 * username and password from the URL query string or body if it exists.
 *
 * Because of the localStrategy function above which does the authentication
 * legwork we need to test for a req.user object in order to send the
 * token information to the client or generate an error response */
Auth.prototype.getToken = function(req, res, next) {
  // If we have a user object the user has been authenticated
  if (req.user) {
    // Generate a placeholder refresh token
    var refreshToken = crypto.randomBytes(40).toString('hex');
    res.send(200,{success:{code:200, status: 'OK', message: 'Success'}, 'access_token': req.user.token, 'expires_in': jwtConfig.tokenValidity, 'refresh_token': refreshToken});
  } else {
    res.send(404,{error:{code:404, status: 'ENOTFOUND', message: 'The username or password is invalid.  Please try again.'}});
  } 
   return next();
};


/** getProfile()
  * This method returns a mock user profile.
  *
  * To demonstrate successful decoding of the JWT token we will pass it
  * verbatim as the HTTP response.  Otherwise, if it's expired, we will
  * return a different error */
Auth.prototype.getProfile = function(req, res, next) {
   if (req.isAuthenticated()) {
    res.send(200,{success:{code:200, status: 'OK', message: 'Success'}, jwt: req.user});
   } else {
    res.send(406,{error:{code:406, status: 'ETOKENINVALID', message: 'The token has expired'}});
   }
   return next();
};

/** Export our route map */
module.exports.route = function(app, passport) {
 /** Exchanges basic credentials for a JWT token */ 
 app.post('/auth/login', function(req, res, next) { passport.authenticate('local',
    function(err, user, info) {
       if (typeof(user) !== 'undefined' && !user.hasOwnProperty('token')) {
          return res.send(401, {error:{code: 401, status: 'ACCESSDENIED', message: 'Access denied'}});
       } else {
          /** Inject the user object or anything else in to the request */
          req.user = user;
          auth.getToken(req, res, next);
       }
 
    })(req,res,next);
 });

  /** A protected endpoint to demonstrate JWT token verification */
  app.get('/user/profile', function(req, res, next) { passport.authenticate('jwt',
    function(err, user, info) {
       if (!user) {
          return res.send(401, {error:{code: 401, status: 'ACCESSDENIED', message: 'Access denied'}});
       } else {
          /** Inject the user object or anything else in to the request */
          req.user = user;
          auth.getProfile(req, res, next);
       }
 
    })(req,res,next);
 });

};



