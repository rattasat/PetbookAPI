var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowerSchema = new Schema({
   lineUserId: String,
   deleteFlag: String
});

mongoose.model('Follower', FollowerSchema);