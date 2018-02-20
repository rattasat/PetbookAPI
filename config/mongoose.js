var config = require('./config');
var mongoose = require('mongoose');

module.exports = function () {
    mongoose.set('debug', config.debug);
    mongoose.connect(config.mongoUri);
    console.log(config.mongoUri);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    require('../server/models/user.model');
    require('../server/models/pet.model');
    require('../server/models/petinlocation.model');
    require('../server/models/follower.model');
    require('../server/models/report.model');
    require('../server/models/Config.model');
    
    return db;
};