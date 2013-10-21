var mongo = require('mongoskin');
var fs = require('fs');
var async = require('async');

//MONGO SETUP
var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'checkin'
};
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');
var $events = db.collection('events');
var $attendees = db.collection('attendees');
var $members = db.collection('members');
var $rsvps = db.collection('rsvps');
var $rsvpattends = db.collection('rsvpattends');

//TODO: don't do this later? for testing this is nice
$attendees.remove();
$rsvpattends.remove();

/*
 * rsvpattends can have 3 cases:
 * rsvp + attend
 * no rsvp + attend
 * rsvp + no attend
*/

//map the date we recorded to an event id
var dates = [
  {key: '10192012', eventId: '84485982'} //d3.geo
  , {key: '02212013', eventId: '102356032'} //intro-d3
  //, {key: '02232013', eventId: '103428452'}
  , {key: '08222013', eventId: '134391752'} //apps and exploration
  , {key: '09162013', eventId: '135789822'} //d3.js and the city
  , {key: '09302013', eventId: '133292932'} //graphs and networks
  ]


async.map(dates, function(date, dateCb) {
  //read the file of attendees
  fs.readFile("attendees/" + date.key + ".json", function(err, data) {
    if(err) return cb(err)
    var eventId = date.eventId + "";
    var attendees = JSON.parse(data);
    console.log("len", attendees.length)
    async.map(attendees, function(attendee, cb) {
      var name;
      if(attendee.member) {
        name = attendee.member.name;
      } else if(attendee.info) {
        name = attendee.info.name;
      }
      $members.findOne({name: name}, function(err, member) {
        if(member) {
          attendee.id = member.id 
        } else {
          delete attendee.id;
        }
        attendee.event = { id: eventId };
        attendee.attended = true;
        if(attendee.checkin.at) {
          attendee.attendedAt = attendee.checkin.at;
        } else {
          attendee.attendedAt = attendee.checkin;
        }
        console.log("CHECKIN", attendee.checkin)
        //delete attendee.checkin;

        //If the attendee has an id, we can look it up in the rsvps
        if(attendee.id) {
          //console.log({'member.member_id': attendee.id, 'event.id': eventId});
          //TODO: fuckin meetup. uses numeric ids for member ids and string ids for events (even tho both are #s)
          $rsvps.findOne({'member.member_id': +attendee.id, 'event.id': eventId}, function(err, rsvp) {
            if(err) return cb(err);

            if(!rsvp) {
              return $attendees.insert(attendee, function(err) {
                if(err) return cb(err);
                $rsvpattends.insert(attendee, cb);
              });
            }
            rsvp.attended = attendee.attended;
            rsvp.attendedAt = attendee.attendedAt;
            $attendees.insert(attendee, function(err) {
              if(err) return cb(err);
              $rsvpattends.insert(rsvp, cb);
            });
          });
        } else {
          //console.log(attendee);
          $attendees.insert(attendee, function(err) {
            if(err) return cb(err);
            $rsvpattends.insert(attendee, cb);
          });
        }
      })
    }, function(err) {
      console.log("error with attendees", err);

      //loop over all the rsvps
      //insert into rsvpattends if it's not already there with attended = false
      //pretty innefficient but fuck it. 
      $rsvps.find({'event.id': eventId}).toArray(function(err, rsvps) {
        if(err) return cb(err);
        async.map(rsvps, function(rsvp, cb) {
          $rsvpattends.findOne({rsvp_id: rsvp.rsvp_id}, function(err, found) {
            if(err) return cb(err);
            //only insert if nothing is found
            if(!found) {
              rsvp.attended = false;
              rsvp.attendedAt = -1;
              $rsvpattends.insert(rsvp, cb);
            } else {
              cb();
            }
          })
        }, dateCb)
      })
    });
  })
  
}, function(err) {
  if(err) {
    console.log("ERROR", err);
  }
  console.log("all done");
  db.close();
  process.exit();
})
