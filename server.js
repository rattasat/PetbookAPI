process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose');
var express = require('./config/express');
var config = require('./config/config');

var db = mongoose();
var app = express();

// var http = require("http");
// setInterval(function () {
//     http.get("http://petbookthaiapi.herokuapp.com");
//     // http.get("http://localhost:8081/");
// }, 300000); // every 5 minutes (300000)

var server = app.listen(process.env.PORT || 8081, function () {
    var port = server.address().port;
    console.log('server is running.. at port: %s', port);
});



module.exports = app;