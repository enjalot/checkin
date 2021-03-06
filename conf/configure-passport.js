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
        //// when DB is setup..
        //User.findOne({ _id: id }, function (err, user) {
            //done(err, user);
        //});
        //
        done(null, {});
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
            // for now, no DB
            return done(null, {id: profile.id});

            //// when db is setup
            //User.findOrCreate({ meetupId: profile.id }, function (err, user) {
                //return done(err, user);
            //});
        }
    ));
};
