var PetInlocation = require('mongoose').model('PetInLocation');
var Pet = require('mongoose').model('Pet');
var User = require('mongoose').model('User');
var line = require('./line.controller');
var moment = require('moment');
var async = require('async');

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
        Pet.findOne({
            _id: req.petid,
            lostStatus: true
        }, function (err, pet) {
            if (err) {
                throw err;
            }
            if (pet) {
                User.findOne({
                        username: req.username
                    }, 'lineStatus lineUserId',
                    function (err, user) {
                        if (err) {
                            throw err;
                        }
                        if (user.lineStatus == 'active') {
                            message = [{
                                'type': 'text',
                                'text': 'พบ ' + req.petname + ' แล้วกรุณาตรวจสอบที่เว็บไซต์'
                            }, {
                                'type': 'location',
                                'title': req.petname,
                                'address': 'Location',
                                'latitude': location.latitude,
                                'longitude': location.longitude
                            }];
                            line.pushmessage(user.lineUserId, message);
                        }
                    });
            }
        })
    });
}

exports.getLocation = function (req, res) {
    if (req.body.sdate == null && req.body.fdate == null) {
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
            return res
                .status(200)
                .json({
                    message: 'ok',
                    location: [{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        created: location.created
                    }]
                });
        });
    } else {
        sdate = req.body.sdate;
        fdate = req.body.fdate;
        PetInlocation.find({
                petId: req.petid,
                created: {
                    '$gte': new Date(sdate),
                    '$lt': new Date(fdate)
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
                return res
                    .status(200)
                    .json({
                        message: 'ok',
                        location: location
                    });
            });
    }
}