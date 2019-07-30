const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
    {
        emails: String,
        interval: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Service', ServiceSchema);
