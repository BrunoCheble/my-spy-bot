const Log = require('../models/Log');

class LogController {

    async findAll(req, res) {
        const { id_filter } = req.params;

        const filter = await Log.find({ _filterId: id_filter }).sort([['createdAt', -1]]);
        return res.json(filter);
    }
}

module.exports = new LogController();
