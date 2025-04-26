const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userMasterSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        role_name: {
            type: String,
            required: true
        },
        role_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Role_master'
        }
    },
});

module.exports = mongoose.model('User_master', userMasterSchema);