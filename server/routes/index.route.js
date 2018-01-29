var user = require('../controllers/index.controller');

module.exports = function(app) {
    app.get('/', user.render);
};