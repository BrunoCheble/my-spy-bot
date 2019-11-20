const Service = require('../models/Service');
const Filter = require('../models/Filter');
const Email = require('../models/Email');
const Advert = require('../models/Advert');
const Bot = require('../models/Bot');
const Log = require('../models/Log');

class ServiceController {

    async findAll(req, res) {

        const service = await Service.find();

        if (service == null) {
            res.status(500);
            return res.json({ error: 'Service not found' });
        }

        return res.json(service);
    }

    async find(req, res) {

        const { password } = req.params;
        const service = await Service.findOne({ password });

        if (service == null) {
            res.status(500);
            return res.json({ error: 'Service not found' });
        }

        let filters = await Filter.find({ _serviceId: service.id });

        filters = await Promise.all(filters.map(async filter => ({
            ...filter._doc,
            adverts: await Advert.find({ _filterId: filter.id }).sort([['active', -1], ['createdAt', -1]])
        })));

        return res.json({ ...service._doc, filters });
    }

    async save(req, res) {

        const { password, interval } = req.params;

        const service = await Service.findOneAndUpdate({ password }, { interval });

        return res.json(service);
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
        return res.json({ working: true });
    }

    async repeat(req, res) {

        const { _serviceId, _filterId } = req.params;
        console.log('Called Repeat - ' + _serviceId + ' / ' + _filterId +' ');
        
        const service = await Service.findById(_serviceId);
        const filter = await Filter.findById(_filterId);

        await Log.deleteMany({ bot: process.env.BOT, _filterId });

        const data = await Bot.runFilter(service, filter, false);
        
        return res.json({ data });
    }

    async start(req, res) {

        const { interval } = req.headers;
        console.log('Called Start - ' + interval);
        await Log.deleteMany({ bot: process.env.BOT });

        const message = await Bot.run(interval);

        return res.json({ message });
    }
}

module.exports = new ServiceController();
