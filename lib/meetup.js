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
function refreshMeetups(userId, callback) {
  //groups for an organizer ( example organizer id: 9776751 Ian)
  //http://www.meetup.com/meetup_api/console/?path=/2/groups
}
exports.refreshMemberships = function refreshMemberships(groupId, callback) {
  //members for group (exmaple group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/members
  console.log("refreshing members for group", groupId);
  var url = meetupUrl("members") + "&group_id=" + groupId;
  batchData(url, function(err, data) {
    if(err) return callback(err);
    var members = parseMembers(data, groupId);
    async.map(members, function(member, memberCb){
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
    async.map(events, function(evt, eventCb){
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
    async.map(rsvps, function(rsvp, rsvpCb){
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

// get rsvps for event
/*
 * client expects member json for an event
 * join member info + rsvp data for event
 */
exports.rsvpMembers = function(options, callback) {
  var eventId = options.eventId;
  var meetupId = options.meetupId;
  //fetch all rsvps for eventId
  db.events.get({ eventId: eventId }).toArray(function(err, rsvps) {
    if(err) return callback(err);
    //join member data to rsvps
    db.members.get({ meetupId: meetupId }).toArray(function(err, members) {
      if(err) return callback(err);
      var membersMap = {};
      members.forEach(function(m) { membersMap[m.memberId] = m });
      var joined = rsvps.map(function(rsvp) {
        var m = membersMap[rsvp.memberId]
        return merge(m, rsvp);
      })
      return callback(null, joined);
    })
  })
}

// get checkins for event

// WRITE to database from app
// check in a member
/*
 * receive a member info + checkin data, update the rsvp collection with checkin
 */

//fetch data from the api in batches
function batchData(url, callback) {
  var totalData = [];
  request(url, batcher);
  function batcher(error, response, body) {
    if (error || response.statusCode != 200) callback(error, response);
    var data;
    try {
      data = JSON.parse(body);
    } catch(e) { return callback(e); }
    var datas = data.results;//parseMembers(data.results, groupId);
    totalData = totalData.concat(datas);
    console.log("progress: ", totalData.length);
    if(data.meta.next && datas.length > 0) {
      request(data.meta.next, batcher);
    } else {
      callback(null, totalData);
    }
  }
}

//only keep a subset of meetup's data in the db, in our own schema
//NOTE: I turn all ids into strings (meetup sometimes uses numbers, sometimes strings...)
function parseMembers(meetupMembers, groupId) {
  var members = meetupMembers.map(function(m) {
    var member = {
      groupId: groupId
    , memberId: m.id + ""
    , name: m.name
    , joined: +new Date(m.joined)
    , link: m.link
    , lon: m.lon
    , lat: m.lat
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
    var evt = {
      groupId: groupId
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
  var rsvps = meetupRsvps.map(function(m) {
    var rsvp = {
      memberId: m.member.member_id
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
