var config = require('./config');
var mongoose = require('mongoose');
mongoose.Promise = Promise;

module.exports = function () {
    mongoose.set('debug', config.debug);
    var options = {
        useMongoClient: true
    };
    
    require('../server/models/user.model');
    require('../server/models/pet.model');
    require('../server/models/petinlocation.model');

    var db = mongoose.connect(config.mongoUri, options);
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // Wait for the database connection to establish, then start the app. 
        console.log("Database connected");                        
    });
    return db;
};