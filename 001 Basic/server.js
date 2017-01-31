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
// These are libraries that the program depends upon to
// function.  You will find them listed in package.json and
// are installed by using 'npm'
var restify = require('restify'); // The main restify library for our API
var cluster = require('cluster'); // To take advantage of multi-core systems
var bunyan = require('bunyan'); // Bunyan logging component
var bsyslog = require('bunyan-syslog'); // Syslog add-on for Bunyan
var config = require('config'); // A convenient module to read config files
var os = require('os'); // A convenient module to access os functions
var path = require('path'); // Library to work with file paths

// Configuration
// The variables below are used throughout the program and are therefore
// declared at the top-level.  We will later discuss scopes and how they
// apply to NodeJS.
var numCPUs = require('os').cpus().length;
var serviceConfig = config.get('general.service');
var httpConfig = config.get('connections.http');
var loggingConfig = config.get('connections.sysLog');

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

//-----------------------------------------------------------------------------
// MAIN CODE BLOCK
//-----------------------------------------------------------------------------

// Fork the cluster.
// By default NodeJS makes use of a single CPU only which is a performance
// limitation in multi-CPU or multi-core systems.  The code below will assist
// NodeJS to make use of all CPUs and cores for maximum performance.
if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(deadWorker, code, signal) {
    var worker = cluster.fork();

    log.error('worker ' + deadWorker.process.pid + ' died');
    log.error('worker ' + worker.process.pid + ' spawned');
  });
} else {
  // Create the server.
  server = restify.createServer({
    name: 'YourAPIExpert',
    log: log,
    version: '1.0.0'
    });
  server.use(restify.CORS({
    origins: [ '*' ],
    methods: ['GET,PUT,POST,DELETE,PATCH,MERGE'],
    headers: ['Content-Type']
  }));
  // RESTify includes a number of bundled plugins (middleware) to make things
  // easier.  Instead of me wasting space in the comments please see
  // http://www.restify.com
  server.use(restify.queryParser());
  server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: true,
    mapFiles: false,
    overrideParams: false,
    multipartHandler: function(part) {
      part.on('data', function(data) {
        // TODO - Do something with multipart data
      });
    },
    multipartFileHandler: function(part) {
      part.on('data', function(data) {
        // TODO - Do something with multipart data
      });
    },
    keepExtensions: false,
    uploadDir: os.tmpdir(),
    multiples: true
  }));
  server.use(restify.gzipResponse());

  // Next we need to incorporate our routes but these can very quickly get
  // out of hand with application logic and what not.  For this reason we
  // move them out of this main file and in to separate smaller files.  Below
  // we provide reference to these files
  require('./route.js')(__dirname+'/controllers', server);

  // Start the server and set it to listen on the port defined in the config.
  server.listen(httpConfig.port, function startServer() {
    log.info('HTTP server listening on port '+httpConfig.port);
  });



}

