var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowerSchema = new Schema({
   lineUserId: {
       type: String,
       unique: true
   },
   deleteFlag: String
});

mongoose.model('Follower', FollowerSchema);