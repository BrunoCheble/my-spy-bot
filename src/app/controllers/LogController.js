const Log = require('../models/Log');

class LogController {

    async findAll(req, res) {
        const { id_filter, bot } = req.params;

        if(id_filter != null) {
            const filter = await Log.find({ _filterId: id_filter, bot }).sort([['createdAt', -1]]);
            return res.json(filter);
        }
        else {
            return res.json({});
        }
    }
}

module.exports = new LogController();