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

  app.get('/checkin/:groupId/:eventId', function(req, res){
    //console.log(req.session);
    var eventId = req.params.eventId;
    var groupId = req.params.groupId;
    res.render('checkin.html', {groupId: groupId, eventId: eventId});
  });

  app.get('/group/:groupId', function(req, res){
    var groupId = req.params.groupId;
    res.render('group.html', {groupId: groupId});
  });

  app.get('/home', function(req, res){
    res.render('home.html');
  });

  app.get('/login', function(req, res){
      res.render('login.html');
  });
  app.get('/loginSuccess', function(req, res){
      res.render('loginSuccess.html');
  });

  function getUserId(req) {
    if(req && req.session
        && req.session
        && req.session.passport
        && req.session.passport.user) {
      var userId = +req.session.passport.user;
      console.log("userId", userId)
      return userId
    } else {
      console.log("no user")
      return;
    }
  }

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

  app.get('/api/refreshMeetups', function(req, res) {
    var userId = getUserId(req);
    if(!userId) { return res.send(403) }
    //only get groups for a user
    meetup.refreshMeetups(userId, function(err){
      console.log("refreshed")
      db.groups.find({"organizer.member_id": userId}).toArray(function(err, groups) {
        console.log("hey", groups)
        res.send({groups: groups})
      });
    });
  })

  app.get('/api/refresh/:groupId', function(req, res){
    res.send('pong');
    //console.log(req.session);
    var groupId = req.params.groupId + "";
    console.log("refreshing group", groupId);
    meetup.refreshMemberships(groupId, function(err){
      console.log('finished memberships!', groupId);
    });
    setTimeout(function() { meetup.refreshEvents(groupId, function(err){
      console.log('finished events!', groupId);
      db.events.find({groupId: groupId}, {snapshot:true}).toArray(function(err, events) {
        async.forEachSeries(events, function(evt, evtCb) {
          console.log("refreshing event", evt.eventId, evt.name);
          //once we have the events lets refresh all the rsvps
          meetup.refreshRsvps(evt.eventId, function(err){
            console.log('finished rsvps!', evt.eventId, evt.name);
            //TODO: update the rsvp counts on the event in the db
            evtCb();
          });
        }, function(err) { console.log("done refreshing", groupId) });
      });
    }), 200});
  });

  //Fetch the rsvps (joined with the members) for a given event and return them to the browser
  app.get('/api/rsvps/:groupId/:eventId', function(req, res) {
    //http://localhost:8000/api/rsvps/3250422/134391752
    //TODO: validation
    var eventId = req.params.eventId;
    var groupId = req.params.groupId;
    meetup.getJoinedMembers({ eventId: eventId, groupId: groupId }, function(err, members) {
      if(err) { console.log("err", err); return res.send(err); }
      res.send(members);
    });
  });

  //Accept checkins and update the rsvps
  app.post('/api/rsvps/:groupId/:eventId', function(req, res) {
    var rsvps = req.body;
    meetup.checkinMembers(rsvps, function(err) {
      if(err) console.log(err);
      res.send(200);
    });
  });

  app.get('/api/events/:groupId', function(req, res) {
    //http://localhost:8000/api/events/3250422
    var groupId = req.params.groupId;
    meetup.getEvents({ groupId: groupId }, function(err, events) {
      if(err) { console.log("err", err); return res.send(err); }
      res.send(events);
    });
  });

  app.get('/api/groups', function(req, res) {
    //http://localhost:8000/api/events/3250422
    meetup.getGroups({ }, function(err, groups) {
      console.log("sup")
      if(err) { console.log("err", err); return res.send(err); }
      res.send(groups);
    });
  });
};

module.exports = routes;
