checkin
=======

This is a simple app for checking people into a meetup and saving the times that they checked in.

We are working on making it simple to oauth with Meetup and start checking people in.


## database dump
for development I've included a dump of the d3 meetup in dump.zip  
just unzip and:
```
mongorestore --db checkin dump/checkin
```


## Database Collections
relevant code in [lib/meetup.js](https://github.com/enjalot/checkin/blob/master/lib/meetup.js) and [lib/database.js](https://github.com/enjalot/checkin/blob/master/lib/database.js)

### users
our users are meetup organizers who are checking people in

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `id`       | String | unique id |
| `memberId` | String | Meetup's unique id for every user |
| `name`     | String ||
| `email`    | String ||
| `accessToken`| String | Meetup API access token |

### accounts
TODO: flesh this out. eventually we will want to let multiple users manage checkins for the same meetup. 

### groups (meetups)
Meetup's data for a group

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `id`  | String | references Meetup's group id |
| `name`| String | |
| `description`| String | HTML |
| `link`| String | |
| `who`| String | what members are called |
| `created`| Number | Unix timestamp |
| `timezone`| String | |
| `group_photo`| JSON | links to various sizes of group photo|
| `country`| String | |
| `city`| String | |
| `lat`| Number | |
| `lon`| Number | |



### members
we store a stripped down copy of the meetup's member data

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `memberId` | String | references Meetup's member id (or UUID for non-members)|
| `isMember` | Boolean | we can have checkins that aren't associated with meetup |
| `groupId`  | String | references Meetup's group id |
| `name`     | String ||
| `bio`      | String | short user defined description|
| `joined`   | Date   | when the member joined the group|
| `link`     | String | Meetup profile link|
| `lon`      | Number ||
| `lat`      | Number ||
| `state`    | String ||
| `city`     | String ||



### events
we store a stripped down copy of the meetup's member data

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `groupId`  | String | references Meetup's group id |
| `eventId`  | String | references Meetup's event id |
| `name`     | String ||
| `venue`    | String ||
| `time`     | Number | Unix timestamp |
| `status`   | String | *past* or *upcoming* |

### rsvps
Meetup has a record for every RSVP to an event. we store a stripped down version

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `rsvpId`   | String | references Meetup's RSVP id |
| `memberId` | String | references Meetup's member id |
| `groupId`  | String | references Meetup's group id |
| `eventId`  | String | references Meetup's event id |
| `response` | String | *yes*, *no*, *waitlist* |
| `rsvpAt`   | Number | Unix timestamp |
| `guests`   | Number |  |

### attends
We store our checkin data. It is possible for people to checkin without an RSVP.

| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `memberId` | String | references Meetup's member id | |
| `eventId`  | String | references Meetup's event id |
| `groupId`  | String | references Meetup's group id |
| `rsvpId`   | String | (optional) references Meetup's RSVP id |
| `checkinAt`| Number | Unix timestamp |


### raw
we keep a copy of what the meetup API returns for posterity  

- *raw_members*
- *raw_events*
- *raw_rsvps*
- *raw_groups*

## Frontend Data Structure
We join several pieces of data together for use on the client side (namely a member + rsvp and possibly attend data)

### profile
| Field      | Type   | Notes |
| ---------- | ------ | ----- |
| `id`       | String | unique id (for checkins not associated with a Meetup account)
| `groupId`  | String | references Meetup's group id |
| `memberId` | String | references Meetup's member id |
| `name`     | String ||
| `bio`      | String | short user defined description|
| `joined`   | Date   | when the member joined the group|
| `link`     | String | Meetup profile link|
| `lon`      | Number ||
| `lat`      | Number ||
| `state`    | String ||
| `city`     | String ||
| `rsvpId`   | String | references Meetup's RSVP id |
| `eventId`  | String | references Meetup's event id |
| `response` | String | *yes*, *no*, *waitlist* |
| `rsvpAt`   | Number | Unix timestamp |
| `guests`   | Number |  |
| `checkinAt`| Number | Unix timestamp (if checked in) |

