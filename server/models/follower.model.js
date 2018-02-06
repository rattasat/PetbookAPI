var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowerSchema = new Schema({
   lineUserId: String
});

mongoose.model('Follower', FollowerSchema);