
var settings = require("./settings");
var groupId = "3250422"
//you can see your meetup api key by using their api explorer:
//http://www.meetup.com/meetup_api/console/?path=/members
var API_KEY = settings.API_KEY;
var url = "https://api.meetup.com/members?key=" + API_KEY + "&sign=true&group_id=" + groupId + "&page=200"

var request = require('request');
var mongo = require('mongoskin');
var totalMembers = [];

//MONGO SETUP
var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'checkin'
};
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');

$members = db.collection("members_raw");
$members.remove();

console.log("request", url)
request(url, fetchMembers)

function fetchMembers(error, response, body) {
  console.log("callback", error, response.statusCode)
  if (!error && response.statusCode == 200) {
    //TODO: try catch?
    var data = JSON.parse(body);
    var members = data.results;
    totalMembers = totalMembers.concat(members);
    console.log(members.length, totalMembers.length)
    if(data.meta.next && members.length > 0) {
      request(data.meta.next, fetchMembers)
    } else {
      //can uncomment for testing
      $members.insert(totalMembers, {safe: true}, function() {
        console.log("done!", totalMembers.length);
        db.close();
        process.exit();
      });
    }
  }
}

