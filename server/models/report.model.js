var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReportSchema = new Schema({
    username: String,
    petId: String,
    created: {
        type: Date,
        default: Date.now
    },
    message: String
});

mongoose.model('Report', ReportSchema);