// ============================================================================
//
// routes.js
//  Handles all the endpoints for the API
//
// ============================================================================
var nconf = require('nconf');
var winston = require('winston');
var async = require('async');
var passport = require('./app-passport');
var meetup = require('./meetup');
var db = require('./database').db;

var routes = function(app){
  // Base endpoints
  // ----------------------------------
  app.get('/', function(req, res){
    //console.log(req.session);
    res.send('pong');
  });

  app.get('/refresh/:groupId', function(req, res){
    res.send('pong');
    //console.log(req.session);
    var groupId = req.params.groupId + "";
    console.log("refreshing group", groupId);
    /*
    meetup.refreshMemberships(groupId, function(){
      console.log('finished memberships!', groupId);
    });
    */
    meetup.refreshEvents(groupId, function(){
      console.log('finished events!', groupId);
      db.events.find({groupId: groupId}, {snapshot:true}).toArray(function(err, events) {
        async.each(events, function(evt, evtCb) {
          console.log("refreshing event", evt.eventId, evt.name);
          //once we have the events lets refresh all the rsvps
          meetup.refreshRsvps(evt.eventId, function(){
            console.log('finished rsvps!', evt.eventId, evt.name);
            evtCb();
          });
        }, function(err) { console.log("done refreshing", groupId) });
      });
    });
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
