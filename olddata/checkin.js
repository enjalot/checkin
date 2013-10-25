var events, members;
var evt;
d3.json("10212013/rsvps.json", function(error, evts) {
  //events = evts;
  //evt = events[0]; //for now only have one event in our events
  evt = { rsvps: evts };
  d3.json("10212013/members.json", function(error, mmbers) {
    members = mmbers;
    render();
  });
});


function render() {
  var checkedin = [];

  var app = d3.select("#display");
  app.select(".save")
    .on("click", output);
    //div that holds all the rsvp cards
  var memberlist = app.select("div.memberlist")
  //div that holds all the checked in
  var checkinlist = app.select("div.checkinlist")
  var input = app.select("input.search")
    .on("keyup", search);

  prepareMembers();
 
  function output(){
    var saved = saveCheckins();
    d3.select("#savearea").text(saved)
      .classed("hidden", false);
    console.log(saved);
  }

  function saveCheckins() {
    var checkedin = _.filter(members, function(d) {
      return !!d.checkin;
    })
    var saved = JSON.stringify(checkedin);
    localStorage.setItem("checkins", saved);

    d3.select(".count").text(checkedin.length)
    return saved;
  }

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


  memberList(members.slice(0, maxRender));

  function memberList(data) {
    var sel = memberlist.selectAll("div.member")
      .data(data, function(d) { return d.name })

    sel.enter()
      .append("div")
      .classed("member", true)
      .each(makeCard)
      .on("click", rsvpclick);

    sel.exit().remove();
    sel.each(updateCard)
  }

  function makeCard(d,i) {
    //TODO new member format uses d.avatar , old uses photo_url
    var baseAvatarUrl = "";
    //var baseAvatarUrl = "http://photos1.meetupstatic.com/photos/member"
    var dis = d3.select(this);
    dis.append("img")
      .attr({
        //src: function(d) { if(d.avatar) { return baseAvatarUrl + d.avatar; }},
        src: function(d) { if(d.photo_url) { return baseAvatarUrl + d.photo_url; }},
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

    svg = dis.append("svg")
      .classed("rsvp", true)
      .attr({
        width: 30, height: 30
      })
    svg
      .append("use")
      .classed("hidden", function(d) {
        if(d.rsvp) {
          //console.log("HI", d.rsvp.response, d.name)
          if (d.rsvp.response === "yes") return false;
        }
        return true;
      })
      .attr({
        "xlink:href": "#rsvpicon",
        transform:"scale(0.3)",
        width: 30,
        height: 30
      })
    svg.append("text")
      .classed("waitlist", true)
      .classed("hidden", function(d) {
        if(d.rsvp) {
          return d.rsvp.response != "waitlist"
        }
        return true;
      })
    .attr({
      y: '20px',
      'font-size': '30px'
    })
    .text("W")

    dis.append("span")
      .text(function(d) {
        return d.name
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
        saveCheckins();
      })

    checkinlist.selectAll("div.checkin")
      .sort(function(a,b) {
        return new Date(a.checkin.at) < new Date(b.checkin.at);
      })

    //update the people in the member list
    search();
    saveCheckins();
  }

  function search() {
    var name = input.node().value.toLowerCase();
    var filtered = _.filter(members, function(r) {
      return r.name.toLowerCase().indexOf(name) >= 0;
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
      id: generateUUID(),
      name: input.node().value
    }
    members.push(newMember);
    rsvpclick(newMember);
    input.node().value = "";
    input.node().focus();
    search();

  })

  function prepareMembers() {
    evt.rsvps.forEach(function(rsvp) {
      //match rsvp to member and update it
      var member = _.find(members, function(d) { return d.id == rsvp.id});
      if(member) mergeRsvp(member, rsvp);
      if(!member) console.log("member for rsvp not found", rsvp);
    })

    var checkins = JSON.parse(localStorage.getItem("checkins"));
    if(checkins) {
      checkins.forEach(function(checkin) {
        //match checkin to member and update it
        var member = _.find(members, function(d) { return d.id == checkin.id});
        if(member) mergeCheckin(member, checkin);
        if(!member) {
          members.push(checkin)
          member = members[members.length-1];
        }
        //console.log("member", member, member.info.name, checkin.info.name)
        rsvpclick(member)
      })
    }
  }
}
function generateUUID() {
  var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
  return uid
}
