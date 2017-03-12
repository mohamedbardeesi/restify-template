/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A basic User mode with MySQL support.
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

// Here we define the User model which is similar to
// Django as used by the Python folks.
module.exports = function(server, Waterline) {
  var User = Waterline.Collection.extend({

    identity: 'auth_user',
    connection: 'myLocalMySql',

    attributes: {
      id: {
        type: 'integer',
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: 'string',
        required: true,
        unique: true
      },
      password: {
        type: 'string',
        required: true
      },
      last_login: {
        type: 'datetime',
      },
      is_superuser: {
        type: 'integer',
        defaultsTo: 0
      },
      first_name: {
        type: 'string'
      },
      last_name: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      is_staff: {
        type: 'integer',
        defaultsTo: 0
      },
      is_active: {
        type: 'integer',
        defaultsTo: 1 // Set to 0 if implementing custom activation routines
      },
      date_joined: {
        type: 'datetime',
        defaultsTo: function () {
            return new Date();
        }
      },
  
    }
  });
server.orm.loadCollection(User);
}
