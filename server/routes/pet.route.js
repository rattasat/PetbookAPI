var pet = require('../controllers/pet.controller');
var petLocation = require('../controllers/petLocation.controller');
var lostpet = require('../controllers/lostpet.controller');
var authorization = require('../middlewares/authorization');
var own = require('../middlewares/own');

module.exports = function (app) {
    app.get('/api/petlist', authorization.verifyAuthor, pet.getPetList);
    app.get('/api/pet/:petid', authorization.verifyAuthor, own.isOwn, pet.getPet);
    app.post('/api/createpet', authorization.verifyAuthor, pet.createPet);
    app.post('/api/updatepet/:petid', authorization.verifyAuthor, own.isOwn, pet.updatePet);
    app.get('/api/deletepet/:petid', authorization.verifyAuthor, own.isOwn, pet.deletePet);
    app.post('/api/reportlocation/:petid', own.own, petLocation.reportLocation);
    app.post('/api/getlocation/:petid', authorization.verifyAuthor, own.isOwn, petLocation.getLocation);
    app.get('/api/getlastlocation/:petid', authorization.verifyAuthor, own.isOwn, petLocation.getLastLocation);
    app.post('/api/reportlost/:petid', authorization.verifyAuthor, own.isOwn, lostpet.reportPet);
};