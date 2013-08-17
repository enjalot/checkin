//============================================================================
//
//passport.js
//  returns a passport object
//
//============================================================================
var nconf = require('nconf');
var passport = require('passport');

//Configure passport
require('../conf/configure-passport')(passport);

//export the client
module.exports = passport;
