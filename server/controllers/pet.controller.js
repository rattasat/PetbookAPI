var Pet = require('mongoose').model('Pet');
var User = require('mongoose').model('User');
var PetInlocation = require('mongoose').model('PetInLocation');
var Report = require('mongoose').model('Report');
var line = require('./line.controller');
var config = require('../../config/config');

exports.getPetList = function (req, res) {
    Pet.find({
            username: req.username
        }, '_id name image',
        function (err, pets) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    });
            }
            if (pets.length == 0) {
                return res
                    .status(200)
                    .json({
                        message: 'no pet'
                    });
            }
            return res
                .status(200)
                .json({
                    message: 'ok',
                    pets
                });
        });
}

exports.createPet = function (req, res) {
    var pet = new Pet(req.body);
    pet.username = req.username;
    pet.save(function (err) {
        if (err) {
            res
                .status(500)
                .json({
                    message: 'server error'
                });
        }
        res
            .status(201)
            .json({
                message: 'created'
            });
    });
}

exports.updatePet = function (req, res) {
    Pet.findOneAndUpdate({
            _id: req.params.petid,
            username: req.username
        }, req.body,
        function (err, pet) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'server error'
                    })
            }
            if (!pet) {
                return res
                    .status(404)
                    .json({
                        message: 'not found'
                    });
            }
            res
                .status(200)
                .json({
                    message: 'ok'
                });
        });
}

exports.petById = function (req, res, next, petid) {
    Pet.findOne({
            _id: petid
        }, '-lostStatus -deleteFlag',
        function (err, pet) {
            if (err) {
                return next(err);
            } else {
                User.findOne({
                        username: pet.username
                    }, 'firstName lastName tel email',
                    function (err, user) {
                        if (err) {
                            return next(err);
                        } else {
                            req.pet = pet;
                            req.user = user;
                            next();
                        }
                    });
            }
        });
};

exports.saveLocation = function (req, res, next, pet) {
    var location = new PetInlocation(req.body);
    location.petid = pet;
    Pet.findOne({
            _id: pet
        }, 'lostStatus username',
        function (err, result) {
            if (err) {
                throw err;
            } else {
                if (result.lostStatus == "1") {
                    User.findOne({
                        username: result.username
                    }, 'lineUserId lineStatus', function (error, lineid) {
                        if (error) {
                            throw error;
                        } else {
                            if (lineid.lineStatus == "active") {
                                var message = "We found your pet, please check on website."
                                line.pushmessage(lineid.lineUserId, message);
                            }
                        }
                    });
                }
            }
        });
    location.save(function (err) {
        if (err) {
            req.result = {
                message: "error"
            };
            next();
        } else {
            req.result = {
                message: "success"
            };
            next();
        }
    });
};

exports.getOwnPet = function (req, res, next, ownpet) {
    if (req.user) {
        Pet.findOne({
                _id: ownpet
            }, '-deleteFlag',
            function (err, pet) {
                if (err) {
                    return next(err);
                } else {
                    PetInlocation.findOne({
                        petid: ownpet
                    }).sort({
                        'created': -1
                    }).exec(function (err, petinlocation) {
                        if (err) {
                            req.jsdata = {
                                pet: pet
                            };
                            next();
                        } else {
                            req.jsdata = {
                                pet: pet,
                                petinlocation: petinlocation,
                                qrcode: {
                                    url: "https://petbookthai.herokuapp.com/" + pet._id
                                }
                            };
                            next();
                        }
                    });
                }
            });
    } else {
        next();
    }
};

exports.getLocation = function (req, res, next) {
    console.log(req.body.sdate);
    PetInlocation.find({
            petid: req.body.petid,
            created: {
                '$gte': new Date(req.body.sdate),
                '$lt': new Date(req.body.fdate)
            }
        }, 'latitude longitude created',
        function (error, location) {
            if (error) {
                var result = {
                    message: "error"
                };
                res.json(result);
            } else {
                var result = {
                    message: "success"
                };
                result.location = location;
                console.log(result);
                res.send(result);
            }
        });
}

exports.getpet = function (req, res, next, reportpet) {
    if (req.user) {
        Pet.findOne({
                _id: reportpet
            }, '-username -deleteFlag',
            function (err, pet) {
                if (err) {
                    throw err;
                } else {
                    req.pet = pet;
                    next();
                }
            });
    } else {
        res.redirect('/login');
    }
}

exports.report = function (req, res) {
    if (req.user) {
        // console.log(req.body);
        // res.send({message: 'error'});
        var username = req.user.username;
        var petId = req.body.petId;
        var message = req.body.message;
        var report = new Report({
            username: username,
            petId: petId,
            message: message
        });
        report.save(function (err) {
            if (err) {
                res.send({
                    message: 'error'
                });
            } else {
                Pet.findOneAndUpdate({
                    _id: petId
                }, {
                    lostStatus: '1'
                }, function (err) {
                    if (err) {
                        res.send({
                            message: 'error'
                        });
                    } else {
                        res.send({
                            message: 'success'
                        });
                    }
                });
            }
        });
    } else {
        res.redirect('/login');
    }
}