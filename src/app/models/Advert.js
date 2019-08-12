const mongoose = require('mongoose');

const AdvertSchema = new mongoose.Schema(
    {
        link: String,
        thumb: String,
        title: String,
        last_price: String,
        _serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
        _filterId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Advert', AdvertSchema);
