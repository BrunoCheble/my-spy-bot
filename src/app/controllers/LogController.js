const Log = require('../models/Log');

class LogController {

    async findAll(req, res) {
        const { _filterId, bot } = req.params;
        const filter = _filterId != null ? await Log.find({ _filterId, bot }).sort([['createdAt', -1]]) : {};        
        return res.json(filter);
    }
}

module.exports = new LogController();