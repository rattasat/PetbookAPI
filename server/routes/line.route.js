var line = require('../controllers/line.controller');

module.exports = function (app) {
    app.post('/webhook', line.webhook);
};