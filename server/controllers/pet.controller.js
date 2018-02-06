var Pet = require('mongoose').model('Pet');
var User = require('mongoose').model('User');
var PetInlocation = require('mongoose').model('PetInLocation');
var line = require('./line.controller');
var config = require('../../config/config');

exports.insertpet = function (req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        var pet = new Pet(req.body);
        pet.lostStatus = "1";
        pet.username = req.user.username;

        pet.save(function (err) {
            if (err) {
                return next(err);
            } else {
                res.redirect('/');
            }
        });
    }
};

exports.renderCreatepet = function (req, res) {
    if (!req.user) {
        res.render('login', {
            title: 'login'
        });
    } else {
        res.render('createpet', {
            title: 'createpet'
        });
    }
};

exports.renderPet = function (req, res) {
    if (req.pet && req.user) {
        res.render('petview', {
            title: 'pet',
            user: req.user,
            pet: req.pet
        });
    }
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

exports.renderSuccess = function (req, res) {
    res.send(req.result.message);
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
                    }, 'lineUserId', function (error, lineid) {
                        if (error) {
                            throw error;
                        } else {
                            if (lineid.lineUserId != "null") {
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

exports.renderOwnPet = function (req, res) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        console.log(req.jsdata);
        res.render('ownpet', {
            title: "pet",
            jsdata: req.jsdata
        });
    }
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