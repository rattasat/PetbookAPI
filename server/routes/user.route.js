var user = require('../controllers/user.controller');
var authorization = require('../middlewares/authorization');

module.exports = function (app) {
    app.post('/api/createuser', user.createUser);
    app.post('/api/login', user.login);
    app.get('/api/user', authorization.verifyAuthor, user.getUser);
    app.post('/api/updateuser', authorization.verifyAuthor, user.updateUser);
};