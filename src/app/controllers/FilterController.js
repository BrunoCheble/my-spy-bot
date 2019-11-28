const Filter = require('../models/Filter');
const Advert = require('../models/Advert');
const Log = require('../models/Log');

class FilterController {

    async find(req, res) {
        const filter = await Filter.find(req.body);
        return res.json(filter);
    }

    async store(req, res) {
        const filter = await Filter.create(req.body);
        return res.json(filter);
    }

    async delete(req, res) {
        const removeAdverts = await Advert.deleteMany({ _filterId: req.params.id });
        const removeLog = await Log.deleteMany({ _filterId: req.params.id });
        const removeFilter = await Filter.deleteOne({ _id: req.params.id });
        return res.json({removeAdverts, removeLog, removeFilter});
    }
}

module.exports = new FilterController();
