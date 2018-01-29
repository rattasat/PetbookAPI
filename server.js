'use strict'

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// var mongoose = require('./config/mongoose');
var mongoose = require('mongoose');
var express = require('./config/express');
var passport = require('./config/passport');
var config = require('./config/config');

module.exports = app;

// var db = mongoose();
var app = express();
var passport = passport();



connect()
    .on(err, console.log)
    .on('disconnected', connect)
    .once('open', listen);

function listen() {
    app.listen(process.env.PORT || 8081, function () {
        var port = server.address().port;
        console.log('server is running.. at port: %s', port);
    });
}

function connect() {
    var options = {
        useMongoClient: true
    };

    var db = mongoose.set('debug', config.debug);

    require('./server/models/user.model');
    require('./server/models/pet.model');
    require('./server/models/petinlocation.model');

    return db;
}