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
    // Base endpoints
    // ----------------------------------
    app.get('/', function(req, res){
        res.send('pong');
    });
    app.get('/login', function(req, res){
        res.render('login.html');
    });
    app.get('/loginSuccess', function(req, res){
        res.render('loginSuccess.html');
    });

    // Meetup endpoints
    // ----------------------------------
    app.get('/auth/meetup', passport.authenticate('meetup'));
    app.get('/auth/meetup/callback',
        passport.authenticate('meetup', { failureRedirect: '/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            return res.render('loginSuccess.html');
        }
    );
};

module.exports = routes;
