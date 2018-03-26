var User = require('mongoose').model('User');
var config = require('../../config/config');

exports.createUser = function (req, res, next) {
    var user = new User(req.body);
    user.save(function (err, user) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'server error'
                });
        }
        var token = user.genToKen(user.username);
        res
            .header('Authorization', 'Bearer ' + token)
            .status(201)
            .json({
                message: 'created'
            });
    });
}

exports.login = function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'server error'
                });
        }
        if (!user || !user.authenticate(req.body.password)) {
            return res
                .status(404)
                .json({
                    message: 'not found user'
                });
        }
        var token = user.genToKen(user.username);
        res
            .status(200)
            .json({
                message: 'ok',
                auth: 'Bearer ' + token,
                firstName: user.firstName
            })
    });
}

exports.getUser = function (req, res) {
    User.findOne({
            username: req.username
        }, 'username lineStatus verifyCode firstName lastName tel email -_id',
        function (err, user) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    });
            }
            res
                .status(200)
                .json({
                    message: 'ok',
                    user: user
                });
        });
}

exports.updateUser = function (req, res) {
    User.findOneAndUpdate({
            username: req.username
        }, req.body,
        function (err, user) {
            if (err) {
                return res
                    .status(500)
                    .res.json({
                        message: 'server error'
                    });
            }
            res
                .status(200)
                .json({
                    message: 'ok'
                });

        });
}