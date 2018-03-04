var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: String,
    firstName: String,
    lastName: String,
    tel: String,
    email: String,
    lineUserId: String,
    lineStatus: String,
    verifyCode: String
    // latitude: String,
    // longitude: String
});

// {
// 	"username": "",
// 	"password": "",
// 	"firstName": "",
// 	"lastName": ""
// }

UserSchema.pre('save', function (next) {
    this.password = this.hashPassword(this.password);
    this.tel = 'null';
    this.email = 'null';
    this.lineUserId = 'null';
    this.lineStatus = 'not active';
    this.verifyCode = this.VerifyCode();
    next();
});

UserSchema.methods.hashPassword = function (password) {
    return bcrypt.hashSync(password, 8);
};

UserSchema.methods.VerifyCode = function () {
    var text = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

UserSchema.methods.authenticate = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.genToKen = function (username) {
    return jwt.sign({
        sub: username
    }, config.secret, {
        expiresIn: '1h'
    });
}

mongoose.model('User', UserSchema);