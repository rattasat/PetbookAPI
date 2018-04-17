var admin = require('../controllers/admin.controller');
var authorization = require('../middlewares/authorization');

module.exports = function (app) {
    app.post('/admin/create', admin.createAdmin);
    app.post('/admin/login', admin.login);
    app.get('/admin/user/list', authorization.verifyAdmin, admin.getUserList);
    app.post('/admin/user/update/:username', authorization.verifyAdmin, admin.updateUser);
    app.get('/admin/report/list', authorization.verifyAdmin, admin.getReportList);
    app.get('/admin/report/remove/:rptid', authorization.verifyAdmin, admin.deleteReport);
}