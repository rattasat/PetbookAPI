var pet = require('../controllers/pet.controller');
var authorization = require('../middlewares/authorization');

module.exports = function (app) {
    // app.get('/createpet', pet.renderCreatepet);
    // app.get('/:petid', pet.renderPet);
    // app.param('petid', pet.petById);
    // app.post('/api/createpet', pet.insertpet);
    // app.post('/reportlocation/:pet', pet.renderSuccess);
    // app.param('pet', pet.saveLocation);
    // app.get('/pet/:ownpet', pet.renderOwnPet);
    // app.param('ownpet', pet.getOwnPet);
    // app.get('/report/:reportpet', pet.renderreport);
    // app.param('reportpet', pet.getpet)
    // app.post('/api/getLocation', pet.getLocation);
    // app.post('/api/report', pet.report);
    app.get('/api/petlist', authorization.verifyAuthor, pet.getPetList);
    app.get('/api/pet/:petid', authorization.verifyAuthor, pet.getPet);
    app.post('/api/createpet', authorization.verifyAuthor, pet.createPet);
    app.post('/api/updatepet/:petid', authorization.verifyAuthor, pet.updatePet);
    app.post('/api/deletepet/:petid', authorization.verifyAuthor, pet.deletePet);
};