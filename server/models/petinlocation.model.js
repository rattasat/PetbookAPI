var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetInLocationSchema = new Schema({
    petId: String,
    latitude: Number,
    longitude: Number,
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('PetInLocation', PetInLocationSchema);