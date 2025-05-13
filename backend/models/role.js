const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roleSchema = new Schema({
    role_name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Role_master', roleSchema);