const { Router } = require('express');

const ServiceController = require('./app/controllers/ServiceController');
const FilterController = require('./app/controllers/FilterController');
const AdvertController = require('./app/controllers/AdvertController');
const LogController = require('./app/controllers/LogController');

const routes = new Router();

routes.get('/log/:id_filter', LogController.findAll);

routes.get('', ServiceController.test);
routes.get('/repeat/:id_service/:id_filter', ServiceController.repeat);
routes.post('/start', ServiceController.start);

routes.post('/services', ServiceController.store);
routes.get('/services', ServiceController.findAll);
routes.get('/services/:id', ServiceController.find);
routes.get('/services/:password/:interval', ServiceController.save);

routes.post('/filters', FilterController.store);
routes.get('/filters', FilterController.find);
routes.get('/filters/delete/:id', FilterController.delete);

routes.get('/adverts', AdvertController.find);

module.exports = routes;
