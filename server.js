// ===========================================================================
//
// **server.js**
//
//      Entry point to start and run the server
//
// ===========================================================================
// Imports
// ---------------------------------------
// Configure app variables
var nconf = require('nconf');
require('./conf/configure')();

// Setup mongo
var db = require('./lib/database');

// Setup app
// ---------------------------------------
// Get the express app (handles its own config)
var app = require('./lib/app');

// Start it up
var server = app.listen(app.get('port'));

// Let the server log know we've connected
// NOTE: Use console log in this case *only* because we always want this
// message to show
console.log('Server started in environment: ' +
    '\033[1;97m\033[4;37m' + nconf.get('NODE_ENV') + '\033[0m');
console.log('Running on port: ' + app.get('port'));

// Catch and shut down errors 
// ---------------------------------------
// Catch the sigint to close the server
var closeEverything = function(err) {
    console.log('Shutting down...do androids dream of electric sheep?');

    if(err){
        // if there are errors, show them
        console.log(err);
        console.log(err.stack);
    }
    // close the express app
    server.close();
    // finally, kill the process
    process.exit();
};

// when `SIGINT` event is recieved (user closes the app), shut down everything
process.on('SIGINT', closeEverything);
process.on('uncaughtException', closeEverything);
