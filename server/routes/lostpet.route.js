var lostpet = require('../controllers/lostpet.controller');

module.exports = function (app) {
    app.get('/lostpets/:day/:month/:year', lostpet.getlostpet);
}