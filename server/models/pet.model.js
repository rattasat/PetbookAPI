var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetSchema = new Schema({
    username: String,
    type: String,
    name: String,
    gender: String,
    age: String,
    image: String,
    remarkable: String,
    lostStatus: String,
    deleteFlag: Boolean
});

mongoose.model('Pet', PetSchema);