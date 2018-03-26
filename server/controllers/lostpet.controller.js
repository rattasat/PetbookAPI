var User = require('mongoose').model('User');
var Pet = require('mongoose').model('Pet');
var Report = require('mongoose').model('Report');
var async = require('async');

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

exports.getReport = async function (req, res) {
    var pet = await Pet.findOne({
        _id: req.petid
    }, 'name')
    Report.find({
            petId: req.petid
        }, 'petId message created',
        function (err, reports) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    })
            }
            if (reports.length == 0) {
                return res
                    .status(200)
                    .json({
                        message: 'no reports',
                        pet: pet
                    })
            }
            res
                .status(200)
                .json({
                    message: 'ok',
                    reports: reports,
                    pet: pet
                });
        });
}

// exports.getReport = async function (req, res) {
//     if (req.params.petid == 'list') {
//         var reports = await Report.find({
//             username: req.username
//         });
//     } else {
//         var reports = await Report.find({
//             username: req.username,
//             petId: req.body.petid
//         });
//     }
//     if (reports.length == 0) {
//         return res
//             .status(200)
//             .json({
//                 message: 'no report'
//             });
//     }
//     var rpt = []
//     for (var i in reports) {
//         var pet = await Pet.findOne({
//             _id: reports[i].petId
//         }, '-username -lostStatus -__v');
//         rpt.push({
//             info: {
//                 text: reports[i].message,
//                 create: reports[i].created
//             },
//             pet: pet
//         });
//     }
//     res
//         .status(200)
//         .json({
//             message: 'ok',
//             report: rpt
//         });
// }