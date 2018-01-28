var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

module.exports = function() {
    var app = express();

    if (process.env.NODE_ENV === 'development'){
        app.use(morgan('dev'));
    } 
    else{
        app.use(compression);
    }

    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.set('views', './server/views');
    app.set('view engine', 'jade');

    require('../server/routes/user.route')(app);
    require('../server/routes/index.route')(app);
    require('../server/routes/pet.route')(app);
    
    app.use(express.static('./public'));
    return app;
};