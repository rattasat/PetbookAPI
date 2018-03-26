var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetSchema = new Schema({
    username: String,
    type: String,
    breed: String,
    name: String,
    gender: String,
    ageYear: Number,
    ageMonth: Number,
    image: String,
    color: String,
    lostStatus: Boolean,
    deleted: Boolean
});

// {
// 	"type": "",
// 	"name": "",
// 	"gender": "",
// 	"age": "",
// 	"image": "",
// 	"remark": ""
// }


// PetSchema.pre('save', function (next) {
//     this.image = null;
//     this.lostStatus = false;
//     next();
// });

mongoose.model('Pet', PetSchema);