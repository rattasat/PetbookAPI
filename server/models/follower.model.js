var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowerSchema = new Schema({
   lineUserId: {
       type: String,
       unique: true
   }
});

mongoose.model('Follower', FollowerSchema);