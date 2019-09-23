const Service = require('../models/Service');
const Filter = require('../models/Filter');
const Email = require('../models/Email');
const Advert = require('../models/Advert');
const Bot = require('../models/Bot');

class ServiceController {

    async find(req, res) {

        const service = await Service.findOne({ password: req.params.id.toLocaleUpperCase() });

        if (service == null) {
            res.status(500);
            return res.json({ error: 'Service not found' });
        }

        let filters = await Filter.find({ _serviceId: service.id });

        filters = await Promise.all(filters.map(async filter => ({
            ...filter._doc,
            adverts: await Advert.find({ _filterId: filter.id }).sort([['active', -1],['createdAt', -1]])
        })));

        return res.json({ ...service._doc, filters });
    }

    async store(req, res) {

        const data = req.body;

        let repeat = true;
        let password = {};

        while (repeat) {
            password = Math.random().toString(36).slice(-6).toLocaleUpperCase();
            repeat = await Service.exists({ password });
        }

        const service = await Service.create({ ...data, password });

        Email.sendMail(data.emails, 'Número do seu Robô', password);

        return res.json(service);
    }

    async test(req, res) {

        const task = await Bot.run(600);
        
        return res.json({ working: true });
    }

    async start(req, res) {
        const interval = req.headers.interval;
        console.log('Called Start - ' + interval);

        const task = await Bot.run(interval);
        return res.json({ message: task });
    }
}

module.exports = new ServiceController();
