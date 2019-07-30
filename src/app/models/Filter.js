const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema(
    {
        title: String,
        url: String,
        filter: mongoose.Schema.Types.Mixed,
        _serviceId: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Filter', FilterSchema);
