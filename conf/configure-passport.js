// ============================================================================
//
// configure-passport.js
// Configures passport related settings
//
// ============================================================================
var nconf = require('nconf');
var winston = require('winston');

var MeetupStrategy = require('passport-meetup').Strategy;

// Configure meetup
// ---------------------------------------
module.exports = function configurePassport(passport){
    // serialize and deserialize session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        //User.findOne({ _id: id }, function (err, user) {
            //done(err, user);
        //});
    });

    // Local
    // ----------------------------------
    // use local strategy to get user auth
    passport.use(new MeetupStrategy({
            consumerKey: nconf.get('meetup:key'),
            consumerSecret: nconf.get('meetup:secret'),
            callbackURL: 'http://localhost:8000/auth/meetup/callback'
        },
        function(token, tokenSecret, profile, done) {
            console.log('Got it', profile, done);
            return done();
            /*
            User.findOrCreate({ meetupId: profile.id }, function (err, user) {
                return done(err, user);
            });
            */
        }
    ));
};
