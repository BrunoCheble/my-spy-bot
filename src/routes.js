const { Router } = require('express');

const ServiceController = require('./app/controllers/ServiceController');
const FilterController = require('./app/controllers/FilterController');
const AdvertController = require('./app/controllers/AdvertController');

const routes = new Router();

routes.get('', ServiceController.test);
routes.post('/start', ServiceController.start);

routes.post('/services', ServiceController.store);
routes.get('/services/:id', ServiceController.find);
routes.get('/services/:password/:interval', ServiceController.save);

routes.post('/filters', FilterController.store);
routes.get('/filters', FilterController.find);
routes.get('/filters/delete/:id', FilterController.delete);

routes.get('/adverts', AdvertController.find);

module.exports = routes;
