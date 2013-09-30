var mongo = require('mongoskin');
var fs = require('fs');
var async = require('async');

var baseAvatarUrl = "http://photos1.meetupstatic.com/photos/member"

var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'checkin'
};

var settings = require('./settings');
var port = settings.port || 8888;

//MONGO SETUP
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');

$members = db.collection("members");
$events = db.collection("events");
$rsvps = db.collection("rsvps");
$rsvpattends = db.collection("rsvpattends");

var evt = {
  name: "Apps + Exploration"
}

async.parallel([
  writeMembers,
  writeEvents,
  writeRsvps
//  writeRsvpAttends
], function(err, results) {
  console.log("done?", err, results)
  db.close();
})

function writeMembers(asyncCb) {
  //write out members
  $members.find({}).toArray(function(err, members) {
    if(err) return asyncCb(err)
    members = parseMembers(members);
    var buffer = stringifyLargeArray(members, 10);
    console.log("MEMBERS", members.length, buffer.length);
    fs.writeFile("_members.json", buffer, function(err) {
      //db.close()
      asyncCb(err)
    });
  })
}

function writeEvents(asyncCb) {
  //write out rsvps
  $events.find({}).toArray(function(err, events) {
    if(err) return asyncCb(err)
    var buffer = JSON.stringify(parseEvents(events));
    console.log("events", events.length);
    fs.writeFile("_events.json", buffer, function(err) {
      asyncCb(err)
    });
  })
}

function writeRsvps(asyncCb) {
  //write out rsvps
  $rsvps.find({}).toArray(function(err, rsvps) {
    if(err) return asyncCb(err)
    rsvps = parseRsvps(rsvps);
    console.log("rsvps", rsvps.length);
    var buffer = stringifyLargeArray(rsvps, 10);
    fs.writeFile("_rsvps.json", buffer, function(err) {
      asyncCb(err)
    });
  })
}

function writeRsvpAttends(asyncCb) {
  //write out rsvps
  $rsvpattends.find({}).toArray(function(err, rsvpattends) {
    if(err) return asyncCb(err)
    
    var buffer = stringifyLargeArray(rsvpattends, 10);
    console.log("rsvpattend", rsvpattends.length);
    fs.writeFile("_rsvpattends.json", buffer, function(err) {
      asyncCb(err)
    });
  })
}


function parseMembers(meetupMembers) {
  var members = meetupMembers.map(function(m) {
    //TODO: this could break easily
    var url = m.photo_url.slice(baseAvatarUrl.length);
    var member = {
      id: m.id,
      name: m.name
    , avatar: url
    , joined: +new Date(m.joined)
    //bio: m.bio
    }
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


function stringifyLargeArray(array, n) {
  var buffer = "[";
  var interval = Math.ceil(array.length / n);
  for(var i = 0; i < n; i++) {
    var slice = array.slice(i*interval, (i+1)*interval);
    console.log("slice", slice.length);
    if(!slice.length) continue;
    newBuffer = JSON.stringify(slice);
    buffer += newBuffer.slice(1, newBuffer.length-1) + ",\n"
  } 
  buffer = buffer.slice(0, buffer.length-2) + "]"
  return buffer;
}
