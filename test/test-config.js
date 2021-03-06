'use strict';

// test-config.js - include the sample config and change some properties for test

var config = require("../config.js");

// Change instance name so we log to test.log
config.instance = 'test';

config.pg.conString = null;

config.port = 8082; // use something different to the default port of 8081 so we don't trip the server test because of a port conflict

// Log into application directory
config.logger.logDirectory = null;

// Export our modified config
module.exports = config;

// Set a session secret so we don't get a build warning during test
config.auth.sessionSecret = 'testing';
