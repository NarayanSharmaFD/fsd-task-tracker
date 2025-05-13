const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const auditSchema = new Schema ({
    task_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Task_master',
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
        required: true
    },
    project_name: {
        type: String,
        required: true
    },
    project_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project_master'
    },
}); 

module.exports = mongoose.model('audit_master', auditSchema);