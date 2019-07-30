const mongoose = require('mongoose');

const AdvertSchema = new mongoose.Schema(
    {
        link: String,
        last_price: Number,
        _serviceId: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Advert', AdvertSchema);
