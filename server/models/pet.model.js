var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetSchema = new Schema({
    username: String,
    type: String,
    name: String,
    gender: String,
    age: String,
    image: String,
    remark: String,
    lostStatus: Boolean
});

// {
// 	"type": "",
// 	"name": "",
// 	"gender": "",
// 	"age": "",
// 	"image": "",
// 	"remark": ""
// }


PetSchema.pre('save', function (next) {
    this.image = null;
    this.lostStatus = false;
    next();
});

mongoose.model('Pet', PetSchema);