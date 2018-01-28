var user = require('../controllers/user.controller');
var passport = require('passport');

module.exports = function(app) {
    app.get('/signup', user.renderSignup);
    app.get('/login', user.renderLogin);
    app.post('/api/registerline', user.registerline);
    app.post('/api/logout', user.logout);
    app.post('/api/signup', user.signup);
    app.post('/api/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

};