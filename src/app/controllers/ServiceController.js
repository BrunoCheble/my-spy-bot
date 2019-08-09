const Service = require('../models/Service');
const Filter = require('../models/Filter');
const Bot = require('../models/Bot');

class ServiceController {

    async find(req, res) {
        const service = await Service.findOne(req.query.id);
        const filters = await Filter.find({ _serviceId: service.id });

        return res.json({...service, filters });
    }

    async store(req, res) {
        const service = await Service.create(req.body);
        return res.json(service);
    }

    async start(req, res) {
        const interval = req.headers.interval;
        console.log('Called Start - ' + interval);

        const task = await Bot.run(interval);
        return res.json({ message: task });
    }
}

module.exports = new ServiceController();
