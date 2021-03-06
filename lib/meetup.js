//collections:
//users, groups (meetups), members, events, rsvps

/*
{ //rsvps (contains checkin data if available
  _id
  memberId: (optional)
  name: String
  status: "yes"/"no"/"waitlist"
  rsvpAt: Date
  checkinAt: Date
  guests: #
  guestCheckins: [ checkinId... ]
*/

var exports = module.exports;
var async = require('async');
var request = require('request');
var uuid = require('uuid');
var nconf = require('nconf');
var db = require('./database').db;
var merge = require('./util').merge;

var apiKey = nconf.get('meetup:api');
function meetupUrl(endpoint) {
  var baseUrl = "https://api.meetup.com/2/" + endpoint
  baseUrl += "?sign=true&key=" + apiKey;
  baseUrl += "&page=200";
  return baseUrl;
}

// UPDATE data from meetup.com
// refresh meetup list
exports.refreshMeetups = function(userId, callback) {
  //groups for an organizer ( example organizer id: 9776751 Ian)
  //http://www.meetup.com/meetup_api/console/?path=/2/groups
  if(!userId) return callback(new Error("no userId"));
  var url = meetupUrl("groups") + "&organizer_id=" + userId;
  console.log("url", url)
  batchData(url, function(err, data) {
    if(err) return callback(err);
    var groups = data;
    async.forEach(groups, function(group, groupCb){
      if(!group) return groupCb()
      db.groups.update(
        {id: group.id},
        group,
        {upsert: true, safe: true},
        groupCb);
    }, callback);
  });
}
exports.refreshMemberships = function refreshMemberships(groupId, callback) {
  //members for group (exmaple group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/members
  console.log("refreshing members for group", groupId);
  var url = meetupUrl("members") + "&group_id=" + groupId;
  batchData(url, function(err, data) {
    if(err) return callback(err);
    var members = parseMembers(data, groupId);
    async.forEach(members, function(member, memberCb){
      if(!member) return memberCb();
      db.members.update(
        {memberId: member.memberId, groupId: member.groupId},
        member,
        {upsert: true, safe: true},
        memberCb);
    }, callback);
  });
};
// refresh event list
exports.refreshEvents = function(groupId, callback) {
  //events for a group ( example group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/events
  console.log("refreshing events for group", groupId);
  var url = meetupUrl("events") + "&group_id=" + groupId + "&status=upcoming,past";
  batchData(url, function(err, data) {
    if(err) return callback(err);
    var events = parseEvents(data, groupId);
    async.forEach(events, function(evt, eventCb){
      if(!evt) return eventCb();
      db.events.update(
        {eventId: evt.eventId, groupId: evt.groupId},
        evt,
        {upsert: true, safe: true},
        eventCb);
    }, callback);
  });
}
// refresh rsvp data
exports.refreshRsvps = function(eventId, callback) {
  //get rsvps for an event ( example event: 134391752 Apps + Exploration)
  //http://www.meetup.com/meetup_api/console/?path=/2/rsvps
  var url = meetupUrl("rsvps") + "&event_id=" + eventId;
  console.log("refreshing rsvps for event", eventId);
  batchData(url, function(err, data) {
    if(err) return callback(err);
    var rsvps = parseRsvps(data);
    async.forEach(rsvps, function(rsvp, rsvpCb){
      if(!rsvp) return rsvpCb();
      db.rsvps.update(
        {rsvpId: rsvp.rsvpId, groupId: rsvp.groupId},
        rsvp,
        {upsert: true, safe: true},
        rsvpCb);
    }, callback);
  });
}

// GET data from database
// get all members
// get list of events

// get members and rsvp/attend data for event
/*
 * client expects member json for an event
 * join member info + rsvp data for event
 */
exports.getJoinedMembers = function(options, callback) {
  var eventId = options.eventId;
  var groupId = options.groupId;
  //fetch all rsvps for eventId
  db.rsvps.find({ eventId: eventId }).toArray(function(err, rsvps) {
    if(err) return callback(err);
    db.attends.find({ eventId: eventId }).toArray(function(err, attends) {
      //join member data to rsvps
      db.members.find({ groupId: groupId }).toArray(function(err, members) {
        if(err) return callback(err);
        var membersMap = {};
        members.forEach(function(m) { membersMap[m.memberId] = m });
        attends.forEach(function(attend) {
          membersMap[attend.memberId].checkinAt = attend.checkinAt;
        });
        rsvps.forEach(function(rsvp) {
          var m = membersMap[rsvp.memberId]
          m.rsvpId = rsvp.Id;
          m.rsvpAt = rsvp.rsvpAt;
          m.response = rsvp.response;
          m.guests = rsvp.guests;
        })
        return callback(null, members);
      })
    });
  })
}

// get checkins for event

// WRITE to database from app
// check in members
/*
 * receive a member info + checkin data, update the attend collection with checkin
 */
exports.checkinMembers = function(profiles, callback) {
  //update the rsvps in the database
  //if not an existing member, need to resolve.
  async.map(profiles, function(profile, profileCb){
    //if the person is not a member, we create one for them.
    if(!profile) return profileCb();
    if(!profile.memberId) {
      //create a member and use it's id to record the attend
      profile.memberId = uuid.v4();
      db.members.insert(profile, function(err) {
        if(err) console.error(err);
        handleAttend(profile, profileCb);
      });
    } else {
      handleAttend(profile, profileCb);
    }
  }, callback);

  function handleAttend(profile, cb) {
    if(profile.checkinAt) {
    //TODO make sure the client adds groupId and eventId to the new profiles
      var attend = {
        memberId: profile.memberId + "",
        rsvpId: profile.rsvpId, //this could be null
        eventId: profile.eventId + "", //this shouldn't be null
        groupId: profile.groupId + "", //this shouldn't be null
        checkinAt: profile.checkinAt
      }
      db.attends.update(
        {memberId: profile.memberId, eventId: profile.eventId},
        attend,
        {upsert: true, safe: true},
        cb);
    } else {
      db.attends.remove({memberId: profile.memberId, eventId: profile.eventId}, cb);
    }
  }
}

exports.getEvents = function(options, callback) {
  var groupId = options.groupId;
  db.events.find({groupId: groupId }).sort({time: -1}).toArray(callback);
};

exports.getGroups= function(options, callback) {
  //TODO: limit this by access control
  db.groups.find({}).sort({name: -1}).toArray(callback);
};


//fetch data from the api in batches
function batchData(url, callback) {
  var totalData = [];
  request(url, batcher);
  function batcher(error, response, body) {
    if (error || response.statusCode != 200) callback(error || { status: response.statusCode }, response);
    var data;
    try {
      data = JSON.parse(body);
    } catch(e) { return callback(e); }
    var datas = data.results;//parseMembers(data.results, groupId);
    totalData = totalData.concat(datas);
    console.log("progress: ", totalData.length, url);
    if(data.meta && data.meta.next && datas.length > 0) {
      setTimeout(function() {
        request(data.meta.next, batcher);
      }, 500)
    } else {
      callback(null, totalData);
    }
  }
}

//only keep a subset of meetup's data in the db, in our own schema
//NOTE: I turn all ids into strings (meetup sometimes uses numbers, sometimes strings...)
function parseMembers(meetupMembers, groupId) {
  var members = meetupMembers.map(function(m) {
    if(!m) return null;
    var member = {
      groupId: groupId + ""
    , memberId: m.id + ""
    , name: m.name
    , bio: m.bio
    , joined: +new Date(m.joined)
    , link: m.link
    , lon: +m.lon
    , lat: +m.lat
    , state: m.state
    , city: m.city
    }
    if(m.photo && m.photo.thumb_link) member.avatar = m.photo.thumb_link;
    return member
  });
  return members;
}

function parseEvents(meetupEvents, groupId) {
  var events = meetupEvents.map(function(e) {
    if(!e || !e.venue) return null;
    var evt = {
      groupId: groupId + ""
    , eventId: e.id + ""
    , name: e.name
    , venue: e.venue.name
    , time: e.time
    , status: e.status
    };
    return evt;
  });
  return events;
}

function parseRsvps(meetupRsvps) {
  if(!meetupRsvps || !meetupRsvps.length) return [];
  var rsvps = meetupRsvps.map(function(m) {
    if(!m || !m.member) return null;
    var rsvp = {
      memberId: m.member.member_id + ""
    , rsvpId: m.rsvp_id + ""
    , eventId: m.event.id + ""
    , groupId: m.group.id + ""
    , response: m.response //yes/no/waitlist
    , rsvpAt: m.created
    , guests: m.guests
    };
    return rsvp;
  });
  return rsvps;
}
