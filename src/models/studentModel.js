const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const studentSchema = new mongoose.Schema({

    teacherId: {
        type: ObjectId,
        ref: "teacher",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    data: [{
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        marks: {
            type: Number,
            required: true,
            trim: true,
        },

        _id: false

    }],
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true })

module.exports = mongoose.model("student", studentSchema);