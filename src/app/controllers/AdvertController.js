const Advert = require('../models/Advert');

class AdvertController {
    async find(req, res) {
        const advert = await Advert.find(req.body);
        return res.json(advert);
    }
}

module.exports = new AdvertController();
