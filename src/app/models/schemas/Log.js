const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
    {
        bot: Number,
        method: String,
        body: mongoose.Schema.Types.Mixed,
        _filterId: mongoose.Schema.Types.ObjectId,
        _serviceId: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Log', LogSchema);
