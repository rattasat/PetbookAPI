var config = require('./config');
var mongoose = require('mongoose');

module.exports = function () {
    mongoose.set('debug', config.debug);
    mongoose.connect(config.mongoUri);

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    require('../server/models/user.model');
    require('../server/models/pet.model');
    require('../server/models/petinlocation.model');
    
    return db;
};