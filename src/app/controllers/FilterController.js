const Filter = require('../models/Filter');
const Advert = require('../models/Advert');

class FilterController {

    async find(req, res) {
        const filter = await Filter.find(req.body);
        return res.json(filter);
    }

    async store(req, res) {
        //const filter = await Filter.create(req.body);
        console.log(req);
        return res.json(req.params);
    }

    async delete(req, res) {
        const removeAdverts = await Advert.deleteMany({ _filterId: req.params.id });
        console.log(removeAdverts);
        const removeFilter = await Filter.deleteOne({ _id: req.params.id });
        console.log(removeFilter);
        return res.json(removeAdverts);
        //5d513304c0bfb40021304c84
    }
}

module.exports = new FilterController();
