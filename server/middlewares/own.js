var Pet = require('mongoose').model('Pet');

exports.isOwn = function (req, res, next) {
    Pet.findOne({
            _id: req.params.petid,
            deleted: false
        }, '_id username',
        function (err, pet) {
            if (err) {
                return res
                    .status(404)
                    .json({
                        message: 'not found pet'
                    });
            }
            if (!pet) {
                return res
                    .status(404)
                    .json({
                        message: 'not found pet'
                    });
            }
            if (req.username != pet.username) {
                return res
                    .status(401)
                    .json({
                        message: 'not allow'
                    });
            }
            req.petid = pet._id;
            next();
        });
}

exports.own = function (req, res, next) {
    Pet.findOne({
            _id: req.params.petid,
            deleted: false
        }, '_id username name',
        function (err, pet) {
            if (err) {
                return res
                    .status(404)
                    .json({
                        message: 'not found pet'
                    });
            }
            if (!pet) {
                return res
                    .status(404)
                    .json({
                        message: 'not found pet'
                    });
            }
            req.petid = pet._id;
            req.petname = pet.name;
            req.username = pet.username;
            next();
        });
}