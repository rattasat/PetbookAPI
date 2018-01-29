var Pet = require('mongoose').model('Pet');
exports.render = function(req, res) {
    if (req.user) {
        Pet.find({
            username: req.user.username
        }, '_id name', 
        function(err, pets) {
            if (err) {
                next(err);
            }
            else {
                res.render('index', {
                    title: 'Petbook',
                    username: req.user.firstName,
                    pets: pets
                });
            }
        });
    }
    else {
        res.redirect('/login');
    }
};

exports.test = function(req, res) {
    res.send("gg");
};

