/* eslint-disable no-underscore-dangle */
const Service = require('../models/schemas/Service');
const Filter = require('../models/schemas/Filter');
const Log = require('../models/schemas/Log');
const Advert = require('../models/schemas/Advert');

const Email = require('../models/Email');
const Bot = require('../models/Bot');

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

        filters = await Promise.all(
            filters.map(async filter => ({
                ...filter._doc,
                adverts: await Advert.find({ _filterId: filter.id }).sort([
                    ['active', -1],
                    ['createdAt', -1],
                ]),
            }))
        );

        return res.json({ ...service._doc, filters });
    }

    async save(req, res) {
        const { password, interval } = req.params;

        const service = await Service.findOneAndUpdate(
            { password },
            { interval }
        );

        return res.json(service);
    }

    async store(req, res) {
        const data = req.body;

        let repeat = true;
        let password = '';

        while (repeat) {
            password = Math.random()
                .toString(36)
                .slice(-6)
                .toLocaleUpperCase();

            repeat = this.existPassword(password);
        }

        const service = await Service.create({ ...data, password });

        Email.sendMail(data.emails, 'Número do seu Robô', password);

        return res.json(service);
    }

    async existPassword(password) {
        const exist = await Service.exists({ password });
        return exist;
    }

    async test(req, res) {
        return res.json({ working: true });
    }

    async repeat(req, res) {
        const { _serviceId, _filterId } = req.params;
        console.log(`Called Repeat - ${_serviceId} / ${_filterId} `);

        const service = await Service.findById(_serviceId);
        const filter = await Filter.findById(_filterId);

        await Log.deleteMany({ bot: process.env.BOT, _filterId });

        const data = await Bot.runFilter(service, filter, false);

        return res.json({ data });
    }

    async start(req, res) {
        const { interval } = req.body;
        console.log(`Called Start - ${interval}`);
        await Log.deleteMany({ bot: process.env.BOT });

        const message = await Bot.run(interval);

        return res.json({ message });
    }
}

module.exports = new ServiceController();
