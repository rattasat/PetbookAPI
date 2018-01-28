var pet = require('../controllers/pet.controller');

module.exports = function(app) {
    app.get('/createpet', pet.renderCreatepet);
    app.get('/:petid', pet.renderPet);
    app.param('petid', pet.petById);
    app.post('/api/createpet', pet.insertpet);
    app.post('/reportlocation/:pet', pet.renderSuccess);
    app.param('pet', pet.saveLocation);
    app.get('/pet/:ownpet', pet.renderOwnPet);
    app.param('ownpet', pet.getOwnPet);
    app.post('/api/getLocation', pet.getLocation);
};

