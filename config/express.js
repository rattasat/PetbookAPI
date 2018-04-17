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

    // var allowCrossDomain = (req, res, next) => {
    //     res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    //     res.header("Access-Control-Allow-Credentials", true);
    //     res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "X-Requested-With, Origin, Authorization, Content-Type, Accept"
    //     );
    //     next();
    // };

    // app.use(allowCrossDomain);
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cors());

    require('../server/routes/user.route')(app);
    require('../server/routes/admin.route')(app);
    require('../server/routes/index.route')(app);
    require('../server/routes/pet.route')(app);
    require('../server/routes/line.route')(app);

    return app;
};