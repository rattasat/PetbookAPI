var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var AdminSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: String
});

AdminSchema.pre('save', function (next) {
    this.password = this.hashPassword(this.password);
    next();
});

AdminSchema.methods.hashPassword = function (password) {
    return bcrypt.hashSync(password, 8);
}

AdminSchema.methods.authenticate = function (password) {
    return bcrypt.compareSync(password, this.password);
}

AdminSchema.methods.genToken = function (username) {
    return jwt.sign({
        sub: username
    }, config.secret, {
        expiresIn: '1h'
    });
}


mongoose.model('Admin', AdminSchema);