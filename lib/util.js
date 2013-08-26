module.exports.merge = merge;

function merge () {
  var merged = {};
  for (var i = 0, l = arguments.length; i < l; i++) {
    var obj = arguments[i];
    for (var k in obj) {
      merged[k] = obj[k];
    }
  }
  return merged;
}
