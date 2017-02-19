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
var passport = require('passport'); // Authentication and authorization
var LocalStrategy = require('passport-local').Strategy; // Local passport strategy
var JwtStrategy = require('passport-jwt').Strategy; // JWT passport strategy
var ExtractJwt = require('passport-jwt').ExtractJwt; // Various JWT extraction methods
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

/** Serialize the user information in to an object */
passport.serializeUser(function(user,done){
    done(null,user);
});

/** De-serialize the user from an object */
passport.deserializeUser(function(user,done){
    done(null,user);
});

/** Configure the local passport strategy
  *
  * This is very rudementary with hard coded credentials to say the least.
  * Ideally one would veryify a hashed version of these credentials against 
  * a database or some other sort of authentication backend before signing
  * a token */
passport.use(new LocalStrategy(
    function(username, password, done) {
      // Test the access credentials
      if (username === "testuser" && password === "testpassword") {
        // They check out OK.  Let's go ahead and format a dummy payload and sign it with our JWT.
        var payload = {username: username, password:password, otherText: 'This is a test message'};
	jwt.sign(payload, jwtConfig.secretKey, { algorithm: 'HS256', expiresIn:parseInt(jwtConfig.tokenValidity), issuer: 'http://www.yourapiexpert.com', audience: 'http://www.yourapiexpert.com', subject:username}, function(err, token) {
		if (err) {
		   return done(true, null);
                } else {
                   return done(null, {token: token});
                }
        });

      } else {
        return done(true, null);
      }
    }));


/** Configure the JWT passport strategy
  *
  * To demonstrate passport's flexibility this function works with the
  * verification of JSON web tokens.  To be somewhat compatible with
  * oAUTH and Bearer tokens we will have this function extract the 
  * JWT from the authorization header */
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = jwtConfig.secretKey;
opts.issuer = 'http://www.yourapiexpert.com';
opts.audience = 'http://www.yourapiexpert.com';
opts.passReqToCallback = true;
passport.use(new JwtStrategy(opts, function(req, jwt_payload, done) {
      // Test for successful verification
      if (jwt_payload.hasOwnProperty('username')) {
         return done(null,jwt_payload);
      } else {
         return done(null, false);
      }

}));

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
module.exports.route = function(app) {

 /** Exchanges basic credentials for a JWT token */ 
 app.post('/auth/login', function(req, res, next) { passport.authenticate('local',
    function(err, user, info) {
       if (!user.hasOwnProperty('token')) {
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



