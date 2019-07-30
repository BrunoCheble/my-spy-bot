const mongoose = require('mongoose');

class Database {
    constructor() {
        this.init();
    }

    init() {
        mongoose.connect(
            process.env.MONGODB,
            {
                useNewUrlParser: true,
            }
        );
    }
}

module.exports = new Database();
