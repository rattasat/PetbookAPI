var User = require('mongoose').model('User');
var jwt = require('jsonwebtoken');
var config = require('../../config/config');

exports.verifyAuthor = function (req, res, next) {
    var authHeader = req.header('Authorization');

    if (!authHeader) {
        return res
            .status(403)
            .json({
                message: 'no token'
            })
    }

    const accessToken = authHeader.match(/Bearer (.*)/)[1];

    jwt.verify(accessToken, config.secret, function (err, decoded) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'fail to authenticate token'
                });
        }
        User.findOne({
            username: decoded.sub
        }, function (err, user) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    });
            }
            if (!user) {
                return res
                    .status(404)
                    .json({
                        message: 'not found'
                    });
            }
            req.username = user.username;
            next();
        });
    });
}