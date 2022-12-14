const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const markSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Subject: {
        type: String,
        required: true
    },
    Marks: {
        type: Number,
        required: true
    },
    teacher: {
        type: ObjectId,
        ref: "teacher"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

});


module.exports = mongoose.model("studentmark", markSchema);