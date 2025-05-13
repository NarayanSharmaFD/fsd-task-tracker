const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskSchema = new Schema ({
    task_name: {
        type: String,
        required: true
    },
    task_description: {
        type: String,
        required: false
    },
    task_due_date: {
        type: Date,
        required: true
    },
    task_owner_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_master'
    },
    project_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project_master'
    },
    status_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Status_master'
    }
}); 

module.exports = mongoose.model('Task_master', taskSchema);