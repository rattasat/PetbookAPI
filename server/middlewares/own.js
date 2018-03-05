var Pet = require('mongoose').model('Pet');

exports.isOwn = function (req, res, next) {
    Pet.findOne({
            _id: req.params.petid
        }, '_id',
        function (err, pet) {
            if (err) {
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