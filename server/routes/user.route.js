var user = require('../controllers/user.controller');
var authorization = require('../middlewares/authorization');

module.exports = function (app) {
    app.post('/user/create', user.createUser);
    app.post('/user/login', user.login);
    app.get('/user', authorization.verifyAuthor, user.getUser);
    app.post('/user/update', authorization.verifyAuthor, user.updateUser);
};