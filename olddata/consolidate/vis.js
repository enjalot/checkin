
var members;
var memberList = [];
var memberLookup = {};

var xf = crossfilter();

var namedim = xf.dimension(function(d) { return d.name });
var score = xf.dimension(function(d) { return d.score });
var yes = xf.dimension(function(d) { return d.yes });
var waitlist = xf.dimension(function(d) { return d.waitlist });
var no = xf.dimension(function(d) { return d.no });

d3.json("members.json", function(err, data) {
  members = data;
  members.forEach(function(member) {
    member.score = 0;
    member.yes = 0;
    member.waitlist = 0;
    member.no = 0;
    memberLookup[member.memberId] = member;
  })
  d3.json("attends.json", load);
});

function load(err, data) {
  for(var i = 0; i < data.length; i++) {
    var d = data[i];
    var id = d.memberId || d.id;
    var member = memberLookup[id];
    if(!member) continue;

    //console.log("D", JSON.stringify(d, null, 2));
    //if(d.attended) console.log("YAY", d)
    if(d.attended) member.score = (member.score + 1) || 1;
    var response = (d.rsvp && d.rsvp.response) ? d.rsvp.response : d.response;
    //console.log(response);
    if(response == "yes") member.yes = (member.yes + 1) || 1;
    if(response == "waitlist") member.waitlist = (member.waitlist + 1) || 1;
    if(response == "no") member.no = (member.no + 1) || 1;
    //member.flake = (d.score / (d.yes + d.waitlist))
    //console.log(d.attended, response, member.score, member.yes)
  }
  members.forEach(function(member) {
    member.flake = Math.floor((10*member.score / (member.waitlist + member.yes + 1)) || 0) /10
    xf.add([member]);
  })
  yes.filter(function(d) { return d > 0 });
  var all = score.top(Infinity);
  all.sort(function(a,b) { return b.score - a.score });

  var scoreExt = d3.extent(all, function(d) { return d.score })
  var yesExt = d3.extent(all, function(d) { return d.yes })
  var noExt = d3.extent(all, function(d) { return d.no })
  var waitExt = d3.extent(all, function(d) { return d.waitlist })
  var flakeExt = d3.extent(all, function(d) { return d.flake })
  console.log("score ext", scoreExt);
  console.log("yes ext", yesExt);
  console.log("no ext", noExt);
  console.log("waitlist ext", waitExt);
  console.log("flake ext", flakeExt);

  var colorScale = d3.scale.linear()
    .domain([0, 0.5, 1])
    .range(["#ff0000", "#04ee40", "#04ee40"])
    .interpolate(d3.interpolateHsl);
  var sizeScale = d3.scale.linear()
  .domain(yesExt)
  .range([35, 70])

  var display = d3.select("#display");
  var memberDivs = display.selectAll("div.member")
    .data(all, function(d) { return d.memberId })
  memberDivs.enter().append("div").classed("member", true);
  function width(d, i) {
    return sizeScale(d.score) + "px"
  }
  memberDivs.style({
    width: width,
    height: width,
    margin: "2px 2px",
    float: "left",
    "font-size": "7px",
    "background-color": function(d,i) { 
      return colorScale(d.flake)
    }
  }).on("click", function(d,i) {
    console.log("d", d);
  })
  .text(function(d) {
    return d.flake
  })

  console.log("members",all);

}
