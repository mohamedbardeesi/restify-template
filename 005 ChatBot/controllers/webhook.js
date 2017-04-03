/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A fun little controller to demonstrate Facebook webhooks
 @author YourAPIExpert <yourapiexpert@gmail.com>
 @version 1.0.0
 @module controller/webhooks
*/

// The Essentials
// These are libraries that the program depends upon to
// function.  You will find them listed in package.json and
// are installed by using 'npm'
var bunyan = require('bunyan'); // Bunyan logging component
var bsyslog = require('bunyan-syslog'); // Syslog add-on for Bunyan
var config = require('config'); // A convenient module to read config files
var request = require('request'); // HTTP/S Requests
var WPAPI = require('wpapi'); // Wordpress API
var util = require('util');
var async = require('async'); // Runs synchronous executions
var natural = require('natural'); // Natural language abilities
var path = require('path'); // Path utilities


// Configuration
var fbConfig = config.get('connections.facebook');
var loggingConfig = config.get('connections.sysLog');
var serviceConfig = config.get('general.service');
var weatherConfig = config.get('connections.openweathermap');
var wordpressConfig = config.get('connections.wordpress');

// Logging Subsystem
// At this early stage I am going to bring in logging as I don't find
// console.log to be a practice I would like to teach.  The same result
// can be achieved by selective logging which has the added benefit of 
// being persistent for later diagnostics and troubleshooting.
var log = bunyan.createLogger({
  name: serviceConfig.name,
  streams: [ {
    level: 'debug',
    type: 'raw',
    stream: bsyslog.createBunyanStream({
    type: 'sys',
    facility: bsyslog.local0,
    host: loggingConfig.host,
    port: loggingConfig.port
    })
  },
  {
    stream: process.stdout,
    level: 'debug'
  }]
});

// Natural Language Module
// Here we train our module to match certain strings and phrases
// to keywords
var classifier = new natural.BayesClassifier();
// Greetings
classifier.addDocument('hi', 'greet');
classifier.addDocument('hello', 'greet');
classifier.addDocument('g\'day', 'greet');
classifier.addDocument('how are you', 'greet');

// Categories
classifier.addDocument('list catergories', 'categories');
classifier.addDocument('show me the categories', 'categories');
classifier.addDocument('what are the catgories', 'categories');
classifier.addDocument('can I see the categories', 'categories');

// Weather
classifier.addDocument('what is the weather', 'weather');
classifier.addDocument('how cold is it', 'weather');
classifier.addDocument('how hot is it', 'weather');
classifier.addDocument('is it raining', 'weather');


classifier.train();


//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

/** Constructor function
  *
  * @exports controller/WebHooks.
  * @constructor
  */
var WebHooks = function() {};

/**
  * Instantiate the class so that we can pass the instance
  * to the caller for use in the routing
  */
var webHooks = new WebHooks();

// Controller.
// Here we implement the application logic to deal with the individual routes.

// You must authenticate to be able to PUT (update) a post
var wp = new WPAPI({
    endpoint: wordpressConfig.url
})



// Takes the formatted message object and sends it to the Facebook graph
// endpoint. Here we will make use of the 'unirest' library rather than
// the standard request library for more features and flexibility.
function callSendAPI(messageData) {
            var rest = require(path.join(__dirname,'../lib/rest/client.js'));
            rest.post('https://graph.facebook.com/v2.6/me/messages', messageData, {strictSSL: false, query:{access_token: fbConfig.accessToken}}, function(err, results) {
		if (!err && results.code == 200) {
		  log.info("Successfully sent message with id %s to recipient %s", results.body.messageId, results.body.recipientId);
		} else {
		  log.error("Unable to send message");
		  log.error(results.body);
		}
          });
}

// This function demonstrates how to notify the sender of message actions.
// Available options are typing_on, typing_off and mark_seen
function sendStatus(recipientId, messageStatus) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: messageStatus
  };
  callSendAPI(messageData);
}


// This function formats a generic text message very much in line with
// any ordinary facebook message.
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}

// This function demonstrates the facebook 'list' template as seen at
// https://developers.facebook.com/docs/messenger-platform/send-api-reference/list-template
//
// We do so by querying a Wordpress installation for its list of categories and
// we then format them in to the template.
//
// Facebook currently only supports a maximum of 4 entries in this specific template
// type so beware of that limitation.  If required in a practical sense a mechanism
// for paging will need to be developed.
function sendCategoriesMessage(recipientId, messageText) {
var elements = [];
var i = 0;

 
wp.categories()
  .then(function(categories) {
    // Set status to let the client know we're doing something
    sendStatus(recipientId, 'typing_on');
    if (typeof(categories) !== 'undefined' && Object.keys(categories).length != 0) {
      async.eachSeries(categories, function(category, callback) {
          if (category.count > 0) {
	       if (i < 4) {
                 var element = {};
                 element.title = category.name;
                 element.subtitle = category.description;
                 element.default_action = {
                                          type: 'web_url',
                                          url: category.link,
                                          messenger_extensions: false,
                                          webview_height_ratio: 'tall',
                                      }
	         element.buttons = [
                                 {
                                   type: 'postback',
				   title: 'List Articles',
                                   payload: 'category '+category.id,
                                 }
                               ]
                 elements.push(element);
               }
               i++;
           }
           return callback(null);
 
      }, function(err) {
            if (!err) {
                var messageData = {
                  recipient: {
                    id: recipientId
                  },
                    message: {
                      attachment: {
                        type: "template",
                        payload: {
                          template_type: "list",
                          top_element_style: 'compact',
                          elements: elements
                        }
                     }
                   }
                };
                callSendAPI(messageData);
             } else {
                sendTextMessage(recipientId, "I'm sorry but there are no categories available to show.");
             }
      });
    } else {
       sendTextMessage(recipientId, "I'm sorry but there are no categories available to show.");
    }
  })
  .catch(function(err) {
     console.log(err);
  });
}


// Similar to the categories above this function queries the Wordpress
// installation for posts within a certain category and formats them 
// according to Facebook's generic template found here:
// https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template
function sendPostsMessage(recipientId, messageText, category) {
var elements = [];
var i = 0;

 
wp.posts().category(category)
  .then(function(posts) {
    // Set status to let the client know we're doing something
    sendStatus(recipientId, 'typing_on');
    async.eachSeries(posts, function(post, callback) {
       if (post.status === 'publish') {
         if (typeof(post.featured_media) !== 'undefined' && post.featured_media != null && post.featured_media != 0) {
           wp.media().id(post.featured_media)
            .then(function(media) {
               var element = {};
               element.item_url = post.link;
               element.title = post.title.rendered;
               element.subtitle = 'Click to read more at';
  	       element.image_url = media.source_url;
	       element.buttons = [
                                 {
                                   type: 'web_url',
                                   url: post.link,
				   title: 'Read Article'
                                 }
                               ]
               elements.push(element);
 	       return callback(null);
            })
            .catch(function(err) {
               log.error(err);
            })
          } else {
               var element = {};
               element.item_url = post.link;
               element.title = post.title.rendered;
               element.subtitle = 'Click to read more at';
	       element.buttons = [
                                 {
                                   type: 'web_url',
                                   url: post.link,
				   title: 'Read Article'
                                 },
                                 {
                                   type: 'web_url',
                                   url: 'https://www.yourapiexpert.com/hire-me/',
                                   title: 'Hire Expert'
                                 }
                               ]
               elements.push(element);
 	       return callback(null);
 

          }
        } else {
 	     return callback(null);
        }
    }, function(err) {
                var messageData = {
                  recipient: {
                    id: recipientId
                  },
                    message: {
                      attachment: {
                        type: "template",
                        payload: {
                          template_type: "generic",
                          elements: elements
                        }
                     }
                   }
                };  

                callSendAPI(messageData);
 
    });     
  })
  .catch(function(err) {
     console.log(err);
  });
}

// This function demonstrates the integration of external APIs in to the
// ChatBot making use of OpenWeatherMaps in this example.
//
// In a practical sense this could be anything - a call to a backend system,
// a database lookup or any other such function accessible by this ChatBot.
function sendWeatherMessage(senderID, messageText) {
	var geo = messageText.match(/(in|at)\s+([A-Za-z0-9\s,]+)\?{0,1}/);
   
        if (!geo) {
	    sendTextMessage(senderID, "I\'m sorry but I wasn't quite able to get the location.  Please say something like \"Johannesburg, South Africa\" or \"Tucson, Arizona\"");
        } else {
            var rest = require(path.join(__dirname,'../lib/rest/client.js'));
            rest.get(weatherConfig.url, {strictSSL: false, query:{appid:weatherConfig.apiKey, q:geo[2].charAt(0).toUpperCase()+geo[2].slice(1),units:'metric'}}, function(err, results) {
                if (!err) {
 		   sendTextMessage(senderID, 'The weather in ' +results.body.name+' is reported to be '+results.body.weather[0].description+'.  The current temperature is '+results.body.main.temp+' degress celcius with a maximum reaching '+results.body.main.temp_max+' degrees today.  The barometer is currently reading '+results.body.main.pressure+' hectopascals.');
                } else {
                   sendTextMessage(senderID, 'I am sorry but I was unable to obtain the current weather at this time.');
                }
            });


        }
}

// This function deconstructs the incoming event off the wire and determines
// the message type.  Text messages are passed through the 'classifier' which
// uses natural language algorithms to determine a specific keyword for the
// ChatBot to act upon.
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var messagePostback = message.payload;
  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (classifier.classify(messageText)) {
      // Be friendly!  After all civiility costs nothing except a few
      // lines of code :p
      case 'greet':
        sendTextMessage(senderID, 'Hi! How can I help you today?  You can ask me things like "show me the categories" or "what\'s the weather in Johannesburg" and I\'ll try me best to help.  So, what will it be?');
         break;

      // Lists the categories
      case 'categories':
        sendTextMessage(senderID, 'Okay, let me retrieve them for you.');
        sendCategoriesMessage(senderID);
        break;

      // Weather related searches
      case 'weather':
        sendWeatherMessage(senderID, messageText);
        break;

      default:
        sendTextMessage(senderID, 'I\'m sorry but I did not understand your question.  You can ask me things like "show me the categories" or "what\'s the weather in Johannesburg" and I\'ll try me best to help.  So, what will it be?');
    }
  }  else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


// The 'categories' function above includes an example of embedding postbacks 
// in to the messages.  This function is called when a postback is received from
// the client.
function receivedPostback(event) {
  var senderID = event.sender.id;
  var payload = event.postback.payload; 
  // Some funky case statements
  switch(true) {
     case /category/.test(payload):
         sendTextMessage(senderID, 'Okay, let me retrieve that for you.');
         sendPostsMessage(senderID, null, payload.split(' ')[1])  
       break;
 
  }
}

/** Export our route map */
module.exports.route = function(app) {

  /** This endpoint is called by Facebook when enabling the application and a token
      verification is required */
  app.get('/webhook', function(req, res, next) { 
    if (req.query.hub.mode === 'subscribe' &&
      req.query.hub.verify_token === fbConfig.verifyToken) {
      log.info("Validating webhook");
      res.send(200,parseInt(req.query.hub.challenge));
    } else {
      log.error("Failed validation. Make sure the validation tokens match.");
      res.send(403);          
    }  
  });


  /** This endpoint is called when an incoming message is received by Facebook */
  app.post('/webhook', function(req, res, next) {
    var data = req.body;
    // Make sure this is a page subscription
    if (data.object === 'page') {
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else if (event.postback) {
            receivedPostback(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.send(200);
    }
  });
  
};



