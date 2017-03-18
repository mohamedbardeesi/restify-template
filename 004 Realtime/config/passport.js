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
var config = require('config'); // Easy configuration file parser

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
                   return done(null,null);
       }));

};
