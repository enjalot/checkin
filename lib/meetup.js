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
/*
{ //member
  _id
  memberId
  name
  avatarUrl
}
*/

var async = require('async');
var request = require('request');
var nconf = require('nconf');
var db = require('./database').db;
var apiKey = nconf.get('meetup:key');
var baseUrl = "https://api.meetup.com/members?sign=true&key=" + apiKey;

module.exports = {};

// UPDATE data from meetup.com
// refresh meetup list
function refreshMeetups(userId, callback) {
  //groups for an organizer ( example organizer id: 9776751 Ian)
  //http://www.meetup.com/meetup_api/console/?path=/2/groups
}
module.exports.refreshMemberships = function refreshMemberships(groupId, callback) {
  //members for group (exmaple group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/members
  var url = baseUrl + "&group_id=" + groupId + "&page=200";

  var totalMembers = [];
  request(url, fetchMembers);
  function fetchMembers(error, response, body) {
    if (error || response.statusCode != 200) callback(error, response);
    var data;
    try {
      data = JSON.parse(body);
    } catch(e) { return callback(e); }

    var members = parseMembers(data.results, groupId);
    totalMembers = totalMembers.concat(members);
    if(data.meta.next && members.length > 0) {
      request(data.meta.next, fetchMembers);
    } else {
      async.map(totalMembers, function(member, memberCb){
        db.members.update({memberId: member.memberId, groupId: member.groupId}, {upsert: true, safe: true}, memberCb);
      }, callback);
    }
  }
};
// refresh event list
function refreshEvents(groupId, callback) {
  //events for a group ( example group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/events
}
// refresh rsvp data
function refreshRsvps(eventId, callback) {
  //get rsvps for an event ( example event: 134391752 Apps + Exploration)
  //http://www.meetup.com/meetup_api/console/?path=/2/rsvps
}

// GET data from database
// get all members
// get list of events

// get rsvps for event
/*
 * client expects member json for an event
 * join member info + rsvp data for event
 */
function rsvpMembers(options, callback) {
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
        var ret = {
          memberId: m.memberId
        , name: m.name
        , avatarUrl: m.avatarUrl
        , rsvpId: rsvp._id
        , rsvp: rsvp.status
        , rsvpAt: rsvp.at
        , guests: rsvp.guests
        }
        if(rsvp.checkinAt) ret.checkinAt = rsvp.checkinAt;
        if(rsvp.guestCheckins) ret.guestCheckins = rsvp.guestCheckins;
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
function parseMembers(meetupMembers, groupId) {
  var members = meetupMembers.map(function(m) {
    var member = {
      groupId: groupId
    , meetupId: m.id
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

function parseRsvps(meetupRsvps) {
  var rsvps = meetupRsvps.map(function(m) {
    var rsvp = {
      id: m.member.member_id,
      evt: m.event.id,
      response: m.response,
      at: m.mtime,
      guests: m.guests
    };
    return rsvp;
  });
  return rsvps;
}

function parseEvents(meetupEvents) {
  var events = meetupEvents.map(function(e) {
    var evt = {
      id: e.id
    , name: e.name
    , venue: e.venue.name
    , time: e.time
    };
    return evt;
  });
  return events;
}

