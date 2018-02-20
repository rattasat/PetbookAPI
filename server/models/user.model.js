var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: String,
    salt: {
        type: String
    },
    lineUserId: String,
    lineStatus: String,
    verifyCode: String,
    latitude: String,
    longitude: String,
    firstName: String,
    lastName: String,
    email: String,
    tel: String,
    role: String
});

UserSchema.pre('save', function (next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 100000, 64, "sha512").toString('base64');
};

UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

mongoose.model('User', UserSchema);