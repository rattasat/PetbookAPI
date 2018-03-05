var PetInlocation = require('mongoose').model('PetInLocation');
var User = require('mongoose').model('User');
var line = require('./line.controller');

exports.reportLocation = function (req, res) {
    var location = new PetInlocation(req.body);
    location.petId = req.params.petid;
    location.save(function (err) {
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
        User.findOne({
                username: req.username
            }, 'lineStatus lineUserId',
            function (err, user) {
                if (err) {
                    throw err;
                }
                if (user.lineStatus == 'active') {
                    line.pushmessage(user.lineUserId, 'พบ ' + req.petname + ' แล้วกรุณาตรวจสอบที่เว็บไซต์');
                }
            });
    });
}

exports.getLocation = function (req, res) {
    PetInlocation.find({
            petid: req.petid,
            created: {
                '$gte': new Date(req.body.sdate),
                '$lt': new Date(req.body.fdate)
            }
        }, 'latitude longitude created',
        function (err, location) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    });
            }
            if (location.length == 0) {
                return res
                    .status(200)
                    .json({
                        message: 'no location'
                    });
            }
            res
                .status(200)
                .json({
                    message: 'ok',
                    location: location
                });
        });
}

exports.getLastLocation = function (req, res) {
    PetInlocation.findOne({
        petId: req.petid
    }).sort({
        'created': -1
    }).exec(function (err, location) {
        if (err) {
            return res
                .status(500)
                .json({
                    message: 'server error'
                });
        }
        if (!location) {
            return res
                .status(200)
                .json({
                    message: 'no location'
                });
        }
        res
            .status(200)
            .json({
                message: 'ok',
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
    });
}