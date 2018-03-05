var PetInlocation = require('mongoose').model('PetInLocation');
var Pet = require('mongoose').model('Pet');

exports.reportLocation = function (req, res) {
    var location = new PetInlocation(req.body);
    location.petid = req.params.petid;
    // console.log(req.params.petid);
    Pet.findOne({
        _id: req.params.petid
    }, function (err, pet) {
        if (err) {
            console.log(err);
            return res
                .status(404)
                .json({
                    message: 'not found pet'
                });
        }
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
        petid: req.petid
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