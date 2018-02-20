var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowerSchema = new Schema({
   lineUserId: {
       type: String,
       unique: true
   },
   latitude: String,
   longitude: String
});

mongoose.model('Follower', FollowerSchema);