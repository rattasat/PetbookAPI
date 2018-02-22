var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({
    accessToken: String,
    channelSecret: String,
    cronTime: String,
});

mongoose.model('Config', ConfigSchema);

