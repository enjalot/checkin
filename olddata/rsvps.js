var request = require('request');
var mongo = require('mongoskin');
var async = require('async');


var settings = require("./settings");
var eventId = "103428452"
var groupId = "3250422"
//you can see your meetup api key by using their api explorer:
//http://www.meetup.com/meetup_api/console/?path=/2/rsvps
var API_KEY = settings.API_KEY;
//var eventsUrl = "https://api.meetup.com/2/events?key=" + API_KEY + "&sign=true&group_id=" + groupId + "&page=200&status=past"
var eventsUrl = "https://api.meetup.com/2/events?key=" + API_KEY + "&sign=true&group_id=" + groupId + "&page=200&status=upcoming"

function rsvpUrl(eventId) {
  return "https://api.meetup.com/2/rsvps?key=" + API_KEY + "&sign=true&event_id=" + eventId + "&page=200"
}

var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'checkin'
};

//MONGO SETUP
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');

$events = db.collection("events");
$rsvps = db.collection("rsvps");

$events.remove()
$rsvps.remove()

//grab all the events

//for all events grab the rsvps

request(eventsUrl, fetchEvents)

function fetchEvents(err, response, body) {
  var data = JSON.parse(body);
  console.log("DATA", data)
  var events = data.results;
  $events.insert(events, {safe: true}, function() {
    async.map(events, fetchRSVPS, function(err, results) {
      async.map(results, function(rsvps, asyncCb) {
        $rsvps.insert(rsvps, {safe: true}, function(err) {
          asyncCb(err);
        })
      }, function(err) {
        console.log("all done");
        if(err) console.log("ERROR", err);
        db.close();
      })
    })
  });
  
} 

function fetchRSVPS(evt, asyncCb) {
  console.log("fetching rsvps for", evt.name);
  var totalRSVPS = [];
  
  request(rsvpUrl(evt.id), requestCb);
  function requestCb(err, response, body) {
    if(err) return asynCb(err);
    if (!err && response.statusCode == 200) {
      //TODO: try catch?
      var data = JSON.parse(body);
      var rsvps = data.results
      totalRSVPS = totalRSVPS.concat(rsvps);
      console.log(evt.name, rsvps.length, totalRSVPS.length)
      if(data.meta.next && rsvps.length > 0) {
        request(data.meta.next, requestCb)
      } else {
        asyncCb(null, totalRSVPS);
      }
    }
  }
}


