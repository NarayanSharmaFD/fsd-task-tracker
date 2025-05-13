const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const auditSchema = new Schema ({
    task_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    task_name: {
        type: String,
        required: true
    },
    prev_status: {
        type: String,
        required: true
    },
    present_status: {
        type: String,
        required: true
    },
    task_owner: {
        type: String,
        required: true,
        ref: 'User_master'
    },
    project_id: {
        type: String,
        required: true
    },
    project_name: {
        type: String,
        required: true
    },
}); 

module.exports = mongoose.model('Audit', auditSchema);