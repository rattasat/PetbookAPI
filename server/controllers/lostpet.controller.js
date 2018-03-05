var User = require('mongoose').model('User');
var Pet = require('mongoose').model('Pet');
var Report = require('mongoose').model('Report');
var Config = require('mongoose').model('Config');
var async = require('async');
var moment = require('moment');

exports.getlostpet = async function (req, res) {
    var config = await Config.findOne({}, 'cronTime -_id');
    var timeFormat;
    var time = config.cronTime.split(" ");
    timeFormat = time[2] + ':' + time[1] + ':' + time[0];
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    var dateFormat = year + '-' + month + '-' + day;
    var fDate = new Date(dateFormat + 'T' + timeFormat);
    var sDate = new Date(fDate);
    sDate.setDate(fDate.getDate() - 1);
    var reports = await Report.find({
        created: {
            '$gte': sDate,
            '$lt': fDate
        }
    });
    var obj = [];
    if (reports.length < 0) {
        obj.push({
            message: 'no report'
        });
    } else {
        obj.push({
            message: 'success'
        });
        for (var i in reports) {
            var pet = await Pet.findOne({
                _id: reports[i].petId
            }, '-lostStatus -deleteFlag -__v');
            var user = await User.findOne({
                username: reports[i].username
            }, 'firstName lastName email tel');
            var rpt = [];
            rpt.push({
                report: {
                    text: reports[i].message,
                    pet: pet,
                    user: user
                }
            });
            obj.push(rpt[0]);
        }
    }
    res.send(obj);
}

exports.reportPet = function (req, res) {
    var report = new Report(req.body);
    report.petId = req.petid;
    report.username = req.username;
    Pet.findOneAndUpdate({
            _id: req.petid
        }, {
            lostStatus: true
        },
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    });
            }
            report.save(function (err) {
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
            });
        });
}

exports.getReportDaily = async function (req, res) {
    var dateFormat = req.params.year + '-' + req.params.month + '-' + req.params.day;
    var sDate = new Date(dateFormat);
    sDate.setHours(00, 00, 00, 000);
    var fDate = new Date(dateFormat);
    fDate.setHours(23, 59, 59, 999);
    var reports = await Report.find({
        created: {
            '$gte': sDate,
            '$lt': fDate
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
        }, '-username -lostStatus -__v');
        var user = await User.findOne({
            username: reports[i].username
        }, 'firstName lastName email tel');
        rpt.push({
            text: reports[i].message,
            pet: pet,
            user: user
        });
    }
    res
        .status(200)
        .json({
            message: 'ok',
            report: rpt
        });
}