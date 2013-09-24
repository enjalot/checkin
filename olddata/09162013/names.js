var fs = require('fs')

var e = fs.readFileSync('./attendErik.json', {encoding: "utf8"})
var m = fs.readFileSync('./attendM.json', {encoding: "utf8"})

var ejson = JSON.parse(e);
var mjson = JSON.parse(m);
var names = [];
var url = "http://www.meetup.com/Bay-Area-d3-User-Group/members/"
var urls = [];

parseName = function(d) {
  names.push(d.name)
  var u;
  if(d.id.length < 11) {
    u = url + d.id
  } else {
    u = ""
  }
  urls.push(u)
  console.log(d.name+",", u)
}
ejson.forEach(parseName);
mjson.forEach(parseName);
//console.log(names, names.length)
