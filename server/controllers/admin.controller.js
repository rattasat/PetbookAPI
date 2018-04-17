var Admin = require('mongoose').model('Admin');
var User = require('mongoose').model('User');
var Report = require('mongoose').model('Report');
var Pet = require('mongoose').model('Pet');
var async = require('async');

exports.createAdmin = function (req, res) {
    var admin = new Admin(req.body);
    admin.save(function (err, admin) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'server error'
                });
        }

        var token = admin.genToken(admin.username);
        res
            .status(201)
            .json({
                message: 'created',
                auth: 'Bearer ' + token,
                username: admin.username
            })
    });
}

exports.login = function (req, res) {
    Admin.findOne({
        username: req.body.username
    }, function (err, admin) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'server error'
                });
        }
        if (!admin || !admin.authenticate(req.body.password)) {
            return res
                .status(404)
                .json({
                    message: 'not found admin'
                });
        }
        var token = admin.genToken(req.body.username);
        res
            .status(200)
            .json({
                message: 'ok',
                auth: 'Bearer ' + token,
                username: admin.username
            });
    });
}

exports.getUserList = function (req, res) {
    User.find({},
        'username firstName lastName tel email ban lineStatus -_id',
        function (err, user) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    })
            }
            res
                .status(200)
                .json({
                    message: 'ok',
                    user: user
                });
        });
}

exports.getReportList = async function (req, res) {
    var sDate = new Date();
    sDate.setHours(00, 00, 00, 000);
    var fDate = new Date(sDate);
    fDate.setHours(23, 59, 59, 999);
    var reports = await Report.find({
        created: {
            '$gte': sDate,
            '$lt': fDate
        }
    }, null, {
        sort: {
            created: -1
        }
    });
    if (reports.length == 0) {
        return res
            .status(200)
            .json({
                message: 'no report'
            });
    }
    var rpt = [];
    for (var i in reports) {
        var pet = await Pet.findOne({
            _id: reports[i].petId
        }, 'name');
        var user = await User.findOne({
            username: reports[i].username
        }, 'username');
        rpt.push({
            text: reports[i].message,
            petname: pet.name,
            username: user.username,
            reportId: reports[i]._id,
            created: reports[i].created
        });
    }
    res
        .status(200)
        .json({
            message: 'ok',
            report: rpt
        });
}

exports.updateUser = function (req, res) {
    User.findOneAndUpdate({
            username: req.params.username
        }, req.body,
        function (err) {
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
                    message: 'ok'
                });
        })
}

exports.deleteReport = function (req, res) {
    Report.remove({
        _id: req.params.rptid
    }, function (err) {
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
                message: 'ok'
            });
    })
}