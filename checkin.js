var events, members;
var evt;
d3.json("02212013/events.json", function(error, evts) {
  events = evts;
  evt = events[0]; //for now only have one event in our events
  d3.json("02212013/members.json", function(error, mmbers) {
    members = mmbers;
    render();
  });
});
  
function prepareMembers() {
  evt.rsvps.forEach(function(rsvp) {
    //match rsvp to member and update it
    var member = _.find(members, function(d) { return d.id == rsvp.id});
    if(member) mergeRsvp(member, rsvp);
    if(!member) console.log("member for rsvp not found", rsvp);
  })

  /*
  checkins.forEach(function(checkin) {
    //match checkin to member and update it
    var member = _.find(members, function(d) { return d.id == checkin.id});
    if(member) mergeCheckin(member, checkin);
    if(!member) console.log("member for checkin not found", checkin);
  })
  */
}

function render() {
  prepareMembers();

  var app = d3.select("#display");
  app.select(".save")
    .on("click", output);
   
  function output(){
    var checkedin = _.filter(members, function(d) {
      return !!d.checkin;
    })
    var saved = JSON.stringify(checkedin);
    d3.select("#savearea").text(saved)
      .classed("hidden", false);
    
    
    console.log(saved);
  }
    
  var checkedin = [];

  members.sort(function(a,b) {
    var adate, bdate;
    if(a.rsvp) { adate = new Date(a.rsvp.at); }
    else { adate = new Date(a.joined); }
    if(b.rsvp) { bdate = new Date(b.rsvp.at); }
    else { bdate = new Date(b.joined); }

    if(adate < bdate) {
      return 1;
    } else {
      return -1;
    }
  })
    
  //div that holds all the rsvp cards
  var memberlist = app.select("div.memberlist")
  //div that holds all the checked in
  var checkinlist = app.select("div.checkinlist")

  memberList(members.slice(0, maxRender));
  
  function memberList(data) {
    var sel = memberlist.selectAll("div.member")
      .data(data, function(d) { return d.info.name })
      
    sel.enter()
      .append("div")
      .classed("member", true)
      .each(makeCard)
      .on("click", rsvpclick);
    
    sel.exit().remove();
    sel.each(updateCard)
  }

  function makeCard(d,i) {
    var dis = d3.select(this);
    dis.append("img")
      .attr({
        src: function(d) { if(d.info.avatar) { return d.info.avatar; }},
      })
      
    dis.append("svg")
      .classed("check", true)
      .attr({
        width: 80, height: 80
      })
      .append("use")
      .classed("hidden", function(d) { return !d.checkin })
      .attr({
        "xlink:href": "#checkicon",
        transform:"scale(0.9)",
        width: 30,
        height: 30
      })

    dis.append("svg")
      .classed("rsvp", true)
      .attr({
        width: 30, height: 30
      })
      .append("use")
      .classed("hidden", function(d) { return !d.rsvp })
      .attr({
        "xlink:href": "#rsvpicon",
        transform:"scale(0.3)",
        width: 30,
        height: 30
      })
      
    dis.append("span")
      .text(function(d) { 
        if(d.info) {
          return d.info.name
        }
      })
  }
  function updateCard(d,i) {
    var dis = d3.select(this);
    dis.classed("checkin", function(d,i) {
      if(d.checkin) return true;
      return false;
    })
    dis.select("svg.rsvp").select("use")
      .classed("hidden", function(d) { return !d.rsvp })
    dis.select("svg.check").select("use")
      .classed("hidden", function(d) { return !d.checkin })
    
  }
          

  function rsvpclick(d) {
    d.checkin = {
      at: new Date()
    }
    checkedin.push(d)
    //d3.select(this).remove();//classed("checkedin", true);
    checkinlist.append("div")
      .datum(d)
      .classed("checkin", true)
      .each(makeCard)
      .on("click", function(c) {
        //oops we dont want them checked in
        delete c.checkin;
        d3.select(this).remove();
        search();
      })
    
    checkinlist.selectAll("div.checkin")
      .sort(function(a,b) { 
        return a.checkin.at < b.checkin.at;
      })
    
    //update the people in the member list
    search();
  }

  var input = app.select("input.search")
    .on("keyup", search);
  function search() {
    var name = input.node().value.toLowerCase();
    var filtered = _.filter(members, function(r) {
      return r.info.name.toLowerCase().indexOf(name) >= 0;
    }).splice(0, maxRender);
    
    memberList(filtered);
  };

  plusone = app.append("div")
    .classed("plusone", true)
    .append("input")
    .attr({
      type: "text"
    })
    .classed("hidden", true)
    .on("keyup", function() {
      var key = d3.event.keyCode;
    if(key === 27) { //escape
        //forget it
        plusone.node().value = "";
        plusone.classed("hidden", true);
      }else if (key === 13) { //enter
        //create a new checkin
        rsvpclick({
          response: "yes",
          member: {
            name: plusone.node().value
          }
        });
        plusone.node().value = "";
        plusone.classed("hidden", true);
      }
    })

  var plus = app.select("button.plus");
  plus.on("click", function() {
    var newMember = {
      info: {
        name: input.node().value
      }
    }
    members.push(newMember);
    rsvpclick(newMember);
    input.node().value = "";
    input.node().focus();
    search();
    
  })
   
    
} 
