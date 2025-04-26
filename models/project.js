const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema ({
    project_name: {
        type: String,
        required: true
    },
    project_description: {
        type: String,
        required: false
    },
    project_start_date: {
        type: Date,
        required: true
    },
    project_end_date: {
        type: Date,
        required: true
    },
    project_owner_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_master'
    }
}); 

module.exports = mongoose.model('Project_master', projectSchema);