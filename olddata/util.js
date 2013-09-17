
var maxRender = 20;
/*
var evt = {
  id: "102356032",
  title: "intro to d3 dot enter long ass name",
  at: new Date(2013, 1, 21, 18, 30),
  createdAt: new Date(2013, 1, 10),
  rsvps: [
  {id:"a", at: new Date(2013, 1, 10)},
  {id:"b", at: new Date(2013, 1, 11), guests: 2},
  {id:"c", at: new Date(2013, 1, 12), guests: 1}
  ]
}

var members = [
  { id: "a", info:{name:"Ian Johnson", twitter:"enjalot"}, createdAt: new Date(2012, 1, 8) },
  { id: "b", info:{name:"Kai Chang", twitter:"syntagmatic"}, createdAt: new Date(2012, 1, 8) },
  { id: "c", info:{name:"Chris Viau", twitter:"d3visualized"}, createdAt: new Date(2012, 1, 9) },
  { id: "d", info:{name:"Sarah Nahm", twitter:"srhnhm"}, createdAt: new Date(2012, 1, 20) },
];

//TODO: check with existing checkins
var checkins = [
{id: "a", at: new Date(2013, 1, 21, 18, 40), guests: []},
{id: "b", at: new Date(2013, 1, 21, 18, 45), guests: []},
];

var xfilter = crossfilter();
var infodim = xfilter.dimension(function(d) { return d.info });
var rsvpdim = xfilter.dimension(function(d) { return d.rsvp });
var checkindim = xfilter.dimension(function(d) { return d.checkin; });
*/

function mergeRsvp(member, rsvp) {
  member.rsvp = {
    response: rsvp.response,
    at: rsvp.at,
    guests: rsvp.guests || 0
  }
}
function mergeCheckin(member, checkin) {
  member.checkin = {
    at: checkin.at,
    guests: checkin.guests || []
  }
}

/*
evt.rsvps.forEach(function(rsvp) {
  //match rsvp to member and update it
  var member = _.find(members, function(d) { return d.id == rsvp.id});
  mergeRsvp(member, rsvp);
})

checkins.forEach(function(checkin) {
  //match checkin to member and update it
  var member = _.find(members, function(d) { return d.id == checkin.id});
  mergeCheckin(member, checkin);
})

//have to add members after they've been updated
xfilter.add(members);

function getCheckedin() {
  checkindim.filter(function(d) {
    if(d) return true;
    return false;
  });
  var checkedin = checkindim.top(maxRender);
  checkindim.filter(null);
  return checkedin;
}
function getFiltered(search) {
  //search is a string with what we want to filter by
  infodim.filter(function(d) {
    if(d.name.indexOf(search) >= 0) {
      return true
    }
    if(d.twitter.indexOf(search) >= 0) {
      return true;
    }
    return false;
  })
  var filtered = infodim.top(maxRender);
  infodim.filter(null);
  return filtered;
}


function updateFiltered(search) {
  var filtered = getFiltered(search)
    console.log("filtered", filtered);
  var filteredDiv = d3.select("#filtered");
  updateCards(filteredDiv, filtered);
}
function updateCheckedin() {
  var checkedin = getCheckedin();
  var checkedinDiv = d3.select("#checkedin")
    updateCards(checkedinDiv, checkedin);
}

function updateCards(div, cards) {
  var sel = div.selectAll("div.card")
    .data(cards, function(d) { return d.id });
  
  sel.enter()
    .append("div")
    .classed("card", true);
  
  sel.classed("checkedin", function(d) {
    if(d.checkin) return true;
    return false;
  })
}

*/


