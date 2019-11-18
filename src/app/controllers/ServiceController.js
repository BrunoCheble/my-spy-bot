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

        const service = await Service.findOne({ password: req.params.id.toLocaleUpperCase() });

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

        const { id_service, id_filter } = req.params;
        console.log('Called Repeat - ' + id_service + ' / ' + id_filter +' ');
        
        const service = await Service.findById(id_service);
        const filter = await Filter.findById(id_filter);

        await Log.deleteMany({ bot: process.env.BOT, _filterId: id_filter });

        const data = await Bot.runFilter(service, filter, false);
        
        return res.json({ data });
    }

    async start(req, res) {

        const { interval } = req.headers;
        console.log('Called Start - ' + interval);
        //const services = await Service.find({ interval });

        await Log.deleteMany({ bot: process.env.BOT });

        const task = await Bot.run(interval);
        return res.json({ message: task });
    }
}

module.exports = new ServiceController();
