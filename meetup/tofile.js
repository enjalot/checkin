var mongo = require('mongoskin');
var fs = require('fs');

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

var evt = {
  name: "Urban Data Hackathon"
}


//write out members
$members.find({}).toArray(function(error, members) {
  var buffer = JSON.stringify(members);
  console.log("MEMBERS", members.length, buffer.length);
  fs.writeFile("members.json", buffer, function(err) {
    //db.close()
    
    //TODO use async to do this...
    //write out rsvps
    $events.find(evt).toArray(function(error, events) {
      var buffer = JSON.stringify(events);
      console.log("events", events.length);
      fs.writeFile("events.json", buffer, function(err) {
        db.close()
      });
    })

    
  });
})





