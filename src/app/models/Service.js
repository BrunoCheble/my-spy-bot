const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
    {
        emails: String,
        password: {
            type: String,
            index: true,
            unique: true
        },
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
