//----------------------------------------------------------------------------
//
//app.js
//
//  The main API server. Uses express to run the server, and provides
//      routes for API functionality
//
//----------------------------------------------------------------------------
//Express setup
var express = require('express');
var passport = require('./app-passport');

var app = express();

//---------------------------------------
//Configuration
//  Configure the app by passing it into the config function
//---------------------------------------
require('../conf/configure-app.js')(app);

//---------------------------------------
// Routes
//---------------------------------------
require('./routes')(app);

module.exports = app;
