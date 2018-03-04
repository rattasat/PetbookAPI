process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose');
var express = require('./config/express');
var config = require('./config/config');

var db = mongoose();
var app = express();

var server = app.listen(process.env.PORT || 8081, function () {
    var port = server.address().port;
    console.log('server is running.. at port: %s', port);
});



module.exports = app;