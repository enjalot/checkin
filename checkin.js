d3.json("rsvps.json", function(rsvps) {
  var display = d3.select("#display");

  //annoying manual process for meetup api scraping
  //http://www.meetup.com/meetup_api/docs/2/rsvps/
  //use event id 84485982 for upcoming d3 geo meetup
  //i also set page=200 (for 1 page with up to 200 results)
  //and you need to clean up the escaped forward slashes \/\/ etc

  var app = display.append("div")
      .classed("app", true);

  var plus = app.append("button")
      .text("+")
      .classed("plus", true)
      
  var input = app.append("input")
    .attr({
      type: "text"
    })

  app.append("button")
    .classed("save", true)
    .text("Save")
    .on("click", output)
    
  function output(){
    console.log(JSON.stringify(checkedin));
  }
    
    
  //var rsvps = tributary.rsvps.results;
  rsvps = rsvps.results;
  var checkedin = [];

  rsvps.sort(function(a,b) {
    if(a.created < b.created) {
      return -1;
    } else if(a.created > b.created) {
      return 1;
    }
  })
    
  //div that holds all the rsvp cards
  var rsvplist = app.append("div")
      .classed("rsvplist", true)
      .style("clear", "left");
  var dr = rsvplist
    .selectAll("div.rsvp")
      .data(rsvps, function(d) { return d.member.name })
    .enter()
    .append("div")
    .classed("rsvp", true);

  //div that holds all the checked in
  var checkinlist = app.append("div")
      .classed("checkinlist", true)
      
      
  dr.filter(function(d) { return d.response !== "yes"; })
    .remove();

  function makecard(div) {
    var dis = d3.select(this);
    dis.append("img")
      .attr({
        src: function(d) { if(d.member_photo) { return d.member_photo.thumb_link; }},
      })
      
    dis.append("span")
      .text(function(d) { 
        if(d.member) {
            return d.member.name
        }
      })
  }
  dr.each(makecard)
          

  dr.on("click", rsvpclick)
  function rsvpclick(d) {
    d.checkin = new Date();
    checkedin.push(d)
    d3.select(this).remove();//classed("checkedin", true);
    checkinlist.append("div")
      .datum(d)
      .classed("checkin", true)
      .each(makecard)
      .on("click", function(c) {
        //oops we dont want them checked in, add back to rsvp
        d3.select(this).remove();
        rsvplist.append("div")
          .datum(c)
          .each(makecard)
          .classed("rsvp", true)
          .on("click", rsvpclick);

        checkedin.splice(checkedin.indexOf(c), 1);
      })
    
    checkinlist.selectAll("div.checkin")
      .sort(function(a,b) { 
        return a.checkin < b.checkin;
      })
  }
    

  input 
    .on("keyup", function() {
      var sel = app.selectAll("div.rsvp");
      //console.log(this.value);
      var name = this.value.toLowerCase();
      var filtered = _.filter(rsvps, function(r) {
        //console.log(r, r.member.name, this.value)
        return r.member.name.toLowerCase().indexOf(name) >= 0;
      });
      
      sel.classed("hidden", true);
      sel
        .data(filtered, function(d) { return d.member.name })
        .classed("hidden", false);
    });

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

  plus.on("click", function() {
    plusone.classed("hidden", false);
    plusone.node().focus()
    
  })
   
    
}) 
