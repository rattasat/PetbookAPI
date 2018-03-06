var pet = require('../controllers/pet.controller');
var petLocation = require('../controllers/petLocation.controller');
var lostpet = require('../controllers/lostpet.controller');
var authorization = require('../middlewares/authorization');
var own = require('../middlewares/own');

module.exports = function (app) {
    app.get('/pet/petlist', authorization.verifyAuthor, pet.getPetList);
    app.get('/pet/:petid', authorization.verifyAuthor, own.isOwn, pet.getPet);
    app.post('/pet/create', authorization.verifyAuthor, pet.createPet);
    app.post('/pet/update/:petid', authorization.verifyAuthor, own.isOwn, pet.updatePet);
    app.get('/pet/delete/:petid', authorization.verifyAuthor, own.isOwn, pet.deletePet);
    app.post('/location/get/:petid', authorization.verifyAuthor, own.isOwn, petLocation.getLocation);
    app.get('/location/last/:petid', authorization.verifyAuthor, own.isOwn, petLocation.getLastLocation);
    app.post('/report/create/:petid', authorization.verifyAuthor, own.isOwn, lostpet.reportPet);
    app.get('/report/reportlist', authorization.verifyAuthor, lostpet.getReportList);

    // Public API
    app.post('/pub/location/:petid', own.own, petLocation.reportLocation);
    app.get('/pub/report/:day/:month/:year', lostpet.getReportDaily);
    app.get('/pub/pet/:petid', own.own, pet.getPubPet);
};