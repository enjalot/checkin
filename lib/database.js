var nconf = require('nconf');

// Mongoskin stuff goes here
module.exports = {};

var mongo = require('mongoskin');

//MONGO SETUP
var mongoConf = {
  type: nconf.get('db:type'),
  host: nconf.get('db:host'),
  port: nconf.get('db:port'),
  db: nconf.get('db:db')
};
console.log("Setting up mongo with settings: " + 
    JSON.stringify(mongoConf, null, 4) + 
    " (change by editting conf/server.json)");

var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');
db.users = db.collection('users');
db.groups = db.collection('groups');
db.members = db.collection('members');
db.events = db.collection('events');
db.rsvps = db.collection('rsvps');
db.attends = db.collection('attends');

module.exports.db = db;


/*
 * MEMBERS
//our schema
{
  groupId: id  //we add this
  "id": 9776751,
  "name": "Ian Johnson",
  "joined": 1328641765000,
  "link": "http://www.meetup.com/members/9776751",
  "thumb": "http://photos2.meetupstatic.com/photos/member/a/6/4/2/thumb_70182562.jpeg", // photo.thumb_link
  "lon": -122.2699966430664,
  "lat": 37.869998931884766
  "state": "CA",
  "city": "Berkeley",
}
//meetup canonical
{
  groupId: id
  "lon": -122.2699966430664,
  "hometown": "Tallahassee",
  "link": "http://www.meetup.com/members/9776751",
  "state": "CA",
  "self": {
    "common": {
    }
  },
  "lang": "en_US",
  "photo": {
    "photo_link": "http://photos4.meetupstatic.com/photos/member/a/6/4/2/member_70182562.jpeg",
    "highres_link": "http://photos2.meetupstatic.com/photos/member/a/6/4/2/highres_70182562.jpeg",
    "thumb_link": "http://photos2.meetupstatic.com/photos/member/a/6/4/2/thumb_70182562.jpeg",
    "photo_id": 70182562
  },
  "city": "Berkeley",
  "country": "us",
  "id": 9776751,
  "visited": 1376698305000,
  "topics": [
    {
      "id": 21123,
      "urlkey": "hacking",
      "name": "Hacking"
    },
    ...
  ],
  "joined": 1328641765000,
  "name": "Ian Johnson",
  "other_services": {
    "twitter": {
      "identifier": "@enjalot"
    }
  },
  "lat": 37.869998931884766
}
*/
