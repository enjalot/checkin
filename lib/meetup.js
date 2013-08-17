//collections:
//users, meetups, members, events, rsvps

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


// UPDATE data from meetup.com
// refresh meetup list
function refreshMeetups(userId, callback) {
  //groups for an organizer ( example organizer id: 9776751 Ian)
  //http://www.meetup.com/meetup_api/console/?path=/2/groups
}
// refresh membership data
function refreshMemberships(meetupId, callback) {
  //members for group (exmaple group: 3250422 bay area d3)
  //http://www.meetup.com/meetup_api/console/?path=/2/members
}
// refresh event list
function refreshEvents(meetupId, callback) {
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

