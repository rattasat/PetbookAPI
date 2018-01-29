var config = require('./config');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = function() {
    mongoose.set('debug', config.debug);
    var db = mongoose.connect(config.mongoUri, {useMongoClient: true});

    require('../server/models/user.model');
    require('../server/models/pet.model');
    require('../server/models/petinlocation.model');

    return db;
};