/**
 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  

 @file A fun little controller to demonstrate socket.io events
 @author YourAPIExpert <yourapiexpert@gmail.com>
 @version 1.0.0
 @module sockets/connection
*/

// The Essentials
var fs = require('fs-extra');
var util = require('util');
var waveform = require('waveform-node');

//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

/** Constructor function
  *
  * @exports sockets/Connection.
  * @constructor
  */
var Connection = function() {};

/**
  * Instantiate the class so that we can pass the instance
  * to the caller for use in the routing
  */
var connection = new Connection();

// Controller.
// Here we implement the application logic to deal with the individual routes.

var Files = {};

/** Export our route map */
module.exports.route = function(app, passport,io) {

io.sockets.on('connection', function (socket) {
        socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
                        var Name = data['Name'];
                        Files[Name] = {  //Create a new Entry in The Files Variable
                                FileSize : data['Size'],
                                Data     : "",
                                Downloaded : 0
                        }
                        var Place = 0;
                        try{
                                var Stat = fs.statSync('static/tmp/' +  Name);
                                if(Stat.isFile())
                                {
                                        Files[Name]['Downloaded'] = Stat.size;
                                        Place = Stat.size / 524288;
                                }
                        }
                        catch(er){} //It's a New File
                        fs.open("static/tmp/" + Name, 'a', 0755, function(err, fd){
                                if(err)
                                {
                                        console.log(err);
                                }
                                else
                                {
                                        Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                                        socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
                                }
                        });
        });

        socket.on('Upload', function (data){
                        var Name = data['Name'];
                        Files[Name]['Downloaded'] += data['Data'].length;
                        Files[Name]['Data'] += data['Data'];
                        if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
                        {
                                fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                                        var inp = fs.createReadStream("static/tmp/" + Name);
					var options = {ffmpegPath:'./ffmpeg'};
						waveform.getWaveForm( __dirname + '/../static/tmp/' + Name, options, function(error, peaks){
						  if(error){
						    console.log(error);
						  }
 
						  // Emit Peaks
                                                  socket.emit('Done', {'peaks' : peaks, 'file': Name});
						});
/*                                        util.pump(inp, out, function(){
                                                fs.unlink("static/tmp/" + Name, function () { //This Deletes The tmporary File
                                                        exec("ffmpeg -i Video/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + Name  + ".jpg", function(err){
                                                                socket.emit('Done', {'Image' : 'Video/' + Name + '.jpg'});
                                                        });
                                                });
                                         });
*/
                                });
                        }
                        else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
                                fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                                        Files[Name]['Data'] = ""; //Reset The Buffer
                                        var Place = Files[Name]['Downloaded'] / 524288;
                                        var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                                        socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
                                });
                        }
                        else
                        {
                                var Place = Files[Name]['Downloaded'] / 524288;
                                var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                                socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
                        }
                });

});

};



