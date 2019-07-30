const Filter = require('../models/Filter');

class FilterController {

    async find(req, res) {
        const filter = await Filter.find(req.body);
        return res.json(filter);
    }

    async store(req, res) {
        const filter = await Filter.create(req.body);
        return res.json(filter);
    }
}

module.exports = new FilterController();
