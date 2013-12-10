//============================================================================
//
//config.js
//  Handles the configuration of a passed in express app object based on 
//      configuration file settings
//
//============================================================================
var nconf = require('nconf');
var _ = require('lodash');
var winston = require('winston');

var configure = function(){
    //order of hiearchy: 1. command line args, 2. environment vars, 3. file 
    nconf.argv()
        .env();

    nconf.file('secrets', __dirname + '/secrets.json');

    // app: { port: xxxx } and other server confi live in this file. Uses
    // default if cannot find file
    var configFile = __dirname + '/server.json';
    nconf.file({file: configFile});

    // Make sure secrets exists / has data
    if(_.keys(nconf.stores.secrets.store).length < 1){
        console.log('conf/secrets.json NOT found! Copy conf/secrets.example.json to conf/secrets.json and modify secrets');
        throw new Error('secrets.json not found! Copy conf/secrets.example.json to conf/secrets.json. View README for setup instructions');
    }

    if(_.keys(nconf.stores.file.store).length < 1){
        console.log('conf/server.json NOT found! Copy conf/server.example.json to conf/server.json, otherwise default server settings will be used');
    }

};

module.exports = configure;
