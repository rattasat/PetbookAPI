var index = require('../controllers/index.controller');

module.exports = function(app) {
    app.get('/', index.welcome);
}