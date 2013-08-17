// ============================================================================
//
// routes.js
//  Handles all the endpoints for the API
//
// ============================================================================
var nconf = require('nconf');
var winston = require('winston');
var passport = require('./app-passport');

var routes = function(app){
    // ----------------------------------
    // Monitoring route
    // ----------------------------------
    app.get('/', function(req, res){
        res.send('pong');
    });
};

module.exports = routes;
