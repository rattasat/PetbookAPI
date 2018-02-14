var User = require('mongoose').model('User');

exports.create = function (req, res, next) {
    var user = new User(req.body);
    user.verifyCode = (Math.floor(Math.random() * Math.floor(9999))).toString();
    user.save(function (err) {
        if (err) {
            return next(err);
        } else {
            var response = {
                result: "ok",
                message: user
            };
            res.json(response);
        }
    });
};

exports.signup = function (req, res, next) {
    if (!req.user) {
        var user = new User(req.body);
        user.lineUserId = "null";
        user.lineStatus = "notActive";
        user.verifyCode = (Math.floor(1000 + Math.random() * 9000)).toString();
        console.log(user.verifyCode);
        user.save(function (err) {
            if (err) {
                return res.redirect('/signup');
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/');
            });
        });
    } else {
        return res.redirect('/');
    }
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

exports.renderSignup = function (req, res) {
    res.render('signup', {
        title: 'signup'
    });
};

exports.renderLogin = function (req, res) {
    if (!req.user) {
        res.render('login', {
            title: 'login'
        });
    } else {
        res.redirect('/');
    }
};