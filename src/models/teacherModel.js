const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      

    },
    password: { 
        type: String,
        required: true,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,

    }


}, { timestamps: true })

module.exports = mongoose.model("teacher", teacherSchema);
