/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A basic RESTify API template for use during YourAPIExpert.com tutorials.
 @author YourAPIExpert <yourapiexpert@gmail.com>
 @version 1.0.0
 @module server
*/

// The Essentials
var fs = require('fs');

//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

// Exports the 'route' function
module.exports = function route(dirname, server) {
  var files = fs.readdirSync(dirname);

  files.forEach(function (file) {
    var filepath = dirname + '/' + file;
    if (fs.statSync(filepath).isDirectory()) {
      route(filepath, server);
    } else {
      var controller = require(filepath);
      controller.route(server);
    }
  });
};
