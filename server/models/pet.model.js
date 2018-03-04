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
    lostStatus: Boolean
});

PetSchema.pre('save', function (next) {
    this.lostStatus = '0';
    next();
});

mongoose.model('Pet', PetSchema);