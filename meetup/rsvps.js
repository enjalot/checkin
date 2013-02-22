
var settings = require("./settings");
var eventId = "102356032"
//you can see your meetup api key by using their api explorer:
//http://www.meetup.com/meetup_api/console/?path=/2/rsvps
var API_KEY= settings.API_KEY;
var url = "https://api.meetup.com/2/rsvps?key=" + API_KEY + "&sign=true&event_id=" + eventId + "&page=200"

var request = require('request');
var mongo = require('mongoskin');

var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'checkin'
};

//MONGO SETUP
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');

$events = db.collection("events");

var totalRSVPS = [];

request(url, fetchRSVPS)

function fetchRSVPS(error, response, body) {
  if (!error && response.statusCode == 200) {
    //TODO: try catch?
    var data = JSON.parse(body);
    var rsvps = parseRSVPS(data);
    totalRSVPS = totalRSVPS.concat(rsvps);
    console.log(rsvps.length, totalRSVPS.length)
    if(data.meta.next && rsvps.length > 0) {
      request(data.meta.next, fetchRSVPS)
    } else {
      //can uncomment for testing
      //$rsvps.remove({});
      var e0 = data.results[0];
      console.log(e0);
      var evt = {
        name: e0.event.name,
        venue: e0.venue.name,
        time: e0.event.time,
        rsvps: totalRSVPS
      }
      $events.insert(evt, {safe: true}, function() {
        db.close();
        process.exit();
      });
    }
  }
}

function parseRSVPS(json) {
  var meetupRSVPS = json.results;
  var rsvps = meetupRSVPS.map(function(m) {
    var rsvp = {
      id: m.member.member_id,
      response: m.response,
      at: m.mtime,
      guests: m.guests
    };
    return rsvp;
  });
  return rsvps;
}

