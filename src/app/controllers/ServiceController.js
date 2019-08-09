const Service = require('../models/Service');
const Filter = require('../models/Filter');
const Email = require('../models/Email');
const Bot = require('../models/Bot');

class ServiceController {

    async find(req, res) {

        const service = await Service.findOne({ password : req.params.id.toLocaleUpperCase() });

        if(service == null) {
            res.status(500);
            return res.json({ error: 'Service not found' });
        }
        
        const filters = await Filter.find({ _serviceId: service.id });
        return res.json({ ... service, filters });
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

        Email.sendMail(data.emails,'Número do seu Robô',password);
        
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
