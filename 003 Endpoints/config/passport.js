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
var LocalStrategy = require('passport-local').Strategy; // Local passport strategy
var JwtStrategy = require('passport-jwt').Strategy; // JWT passport strategy
var ExtractJwt = require('passport-jwt').ExtractJwt; // Various JWT extraction methods
var jwt = require('jsonwebtoken'); // Jason Web Tokens
var config = require('config'); // Easy configuration file parser
var crypto = require('crypto'); // Cryptographic library
var hashers = require('node-django-hashers'); // PBKDF2 hasher

// Configuration
var jwtConfig = config.get('jwt');

//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

/** Constructor function
  *
  * @exports config/passport
  * @constructor
  */

module.exports = function(passport,app) {

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

	app.models.auth_user.findOne({username: username, is_active: 1}, function(err,model) {
	  if (err) {
             return done(true,null);
          } else {
		var hash_name = hashers.identifyHasher(model.password);
		var hash_algorithm = hashers.getHasher(hash_name);
                if (hash_algorithm.verify(password, model.password)) {
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
                   return done(true,null);
                }
  	  }
	});

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


};
