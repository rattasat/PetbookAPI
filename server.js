process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var mongoose = require('./config/mongoose'); 
var express = require('./config/express');
var passport = require('./config/passport');

var db = mongoose();
var app = express();
var passport = passport();

var server = app.listen(process.env.PORT || 8081, function() {
    var port = server.address().port;
    console.log('server is running.. at port: %s', port);
});

module.exports = app;