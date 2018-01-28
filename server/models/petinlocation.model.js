var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetInLocationSchema = new Schema({
    petid: String,
    latitude: String,
    longitude: String,
    created: { 
        type: Date,
        default: Date.now 
    }
});

mongoose.model('PetInLocation', PetInLocationSchema);