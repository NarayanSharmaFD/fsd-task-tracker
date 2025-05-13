const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const statusSchema = new Schema ({
    status_name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Status_master', statusSchema);