var Pet = require('mongoose').model('Pet');
var User = require('mongoose').model('User');

exports.getPetList = function (req, res) {
    Pet.find({
            username: req.username,
            deleted: false
        }, '_id name image', {
            sort: {
                name: 1
            }
        },
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

exports.getPet = function (req, res) {
    Pet.findOne({
            _id: req.petid
        }, '-__v',
        function (err, pet) {
            if (err) {
                return res
                    .status(404)
                    .json({
                        message: 'not found pet'
                    });
            }
            res
                .status(200)
                .json({
                    message: 'ok',
                    pet: pet
                });
        });
}

exports.createPet = function (req, res) {
    var pet = new Pet(req.body);
    pet.username = req.username;
    pet.image = null;
    pet.lostStatus = false;
    pet.deleted = false;
    pet.save(function (err) {
        if (err) {
            return res
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
            _id: req.petid
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
        });
}

exports.deletePet = function (req, res) {
    Pet.findByIdAndUpdate({
            _id: req.petid
        }, {
            deleted: true
        },
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
        });
}

exports.getPubPet = async function (req, res) {
    var pet = await Pet.findOne({
        _id: req.petid
    }, '-username -__v');
    var user = await User.findOne({
        username: req.username
    }, 'firstName lastName email tel -_id');
    res
        .status(200)
        .json({
            message: 'ok',
            pet: pet,
            user: user
        });
}