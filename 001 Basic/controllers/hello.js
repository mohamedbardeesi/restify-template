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

//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

// Begin be delcaring a class

var Hello = function() {};

// Routing.
// Here we instantiate the new class and assign routes to it.
// Routes, in essence, react to events (GET/POST/etc) by passing the control
// to other functions in the application.

var hello = new Hello();

// In this tutorial I will demonstrate how to extract and respond to data
// in the popular GET and POST requests.
module.exports.route = function(app) {
  app.post('/hello', hello.doPost);
  app.get('/hello/:name', hello.doGet);
};


// Controller.
// Here we implement the application logic to deal with the individual routes.

// doPost()
// In POST calls the majority of data is sent to the server in the BODY.  
// In the main server.js code we enabled a plugin/middleware to help us work
// with the body.  Conveniently this plugin offers us a variable in which the
// extracted body is contained.
Hello.prototype.doPost = function(req, res, next) {

  // 'req' above is the request object whilst 'res' is the response object.
  // Conveniently thanks to the bodyParser plugin/middleware the submitted
  // body is available in req.body
  //
  // As out content type is application/json the body is a plain object so it
  // is trivial to extract the required information.
  //
  // But first, some sanity checking.
  if(req.body.hasOwnProperty('hello')){
    // We have the required property so let's extract is and return it in a 
    // response to the caller.
    res.send({'result':{'response':'Hello '+req.body.hello}});
  } else {
    // The supplied body does not conform so we need to issue an error.  For 
    // convenience to the calling application and to conform to standards we
    // will issue a JSON parsable response.
    res.send(400, {'error':{'code':400, 'status':'BadRequest','message':'The body does not match the required schema'}})
  }

  // Return control back to the caller
  return next();
};

// doGet()
// This example demonstrates how parameters can be extracted from the URL.  In
// the route above we have specified it as '/hello/:name'. RESTify will make
// available any text supplied after /hello in a 'name' variable as
// demonstrated below. 
Hello.prototype.doGet = function(req, res, next) {
  // The 'req' object will contain a special property called 'params'.  Within
  // the 'params' property are the substituted variables extracted from the URL.
  //
  // We will be interested in a property called req.param.name

  res.send({'result':{'response':'Hello '+req.params.name}});

  // Return control back to the caller
  return next();
};

