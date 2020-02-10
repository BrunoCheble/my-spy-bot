const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema(
    {
        url: String,
        type: String,
        num_bot: Number,
        active: {
            type: Boolean,
            default: true,
        },
        _groupId: mongoose.Schema.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Bot', BotSchema);
