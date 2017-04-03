/**

 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A class for connecting to services via REST
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


// The Helpers
// These libraries provide us with some additional functionalities.
var shallowCopy = require((path.join(__dirname,'../utils.js'))).shallowCopy;



// The Code
/**
 * creates a rest client
 * @public
 * @function createClient
 * @param    {Object} options an options object
 * @returns  {Client}
 */
function createClient(options) {

   var opts = shallowCopy(options || {});
   var Client = require(path.join(__dirname,'../rest/client.js'));

   var client = new Client(opts);
   return (client);
}





// Exports
module.exports = {
    // REST Client Connection
    createClient: createClient,
    

    errors: {}

};

