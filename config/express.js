var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

module.exports = function () {
    var app = express();

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    // app.use(cors());

    app.set('views', './server/views');
    app.set('view engine', 'jade');

    require('../server/routes/user.route')(app);
    require('../server/routes/index.route')(app);
    require('../server/routes/pet.route')(app);
    require('../server/routes/line.route')(app);
    require('../server/routes/lostpet.route')(app);
    app.use(express.static('./public'));
    return app;
};