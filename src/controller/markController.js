const markModel = require("../models/studentMarkModel");
const mongoose = require("mongoose")


const createStudent = async function (req, res) {
    try {
        if (Object.keys(req.body).length < 1) return res.status(400).send({ status: false, msg: "Request Body Cant Be Empty" });
        const { Name, Subject, Marks } = req.body;
        if (!Name || typeof Name != "string" || !/^[a-zA-Z ]*$/.test(Name)) {
            return res.status(400).send({ status: false, msg: "Name Is A Mandatory Field And Should Be A Alphabetical String Only" });
        };
        if (!Subject || typeof Subject != "string" || !/^[a-z\d\-_\s]+$/i.test(Subject)) {
            return res.status(400).send({ status: false, msg: "Subject Is A Mandatory Field And Should Be A AlphaNumeric String Only" });
        };
        if (!Marks || typeof Marks != "number") {
            return res.status(400).send({ status: false, msg: "Marks Is A Mandatory Field And Should Be A Number Only" });
        };
        req.body.teacher = req.decodedToken.userId;

        const studentExists = await markModel.findOne({ Name: { $regex: Name, $options: "$i" }, Subject: Subject });
        if (studentExists) {
            if (studentExists.teacher != req.decodedToken.userId) return res.status(401).send({ status: false, msg: "Unauthorised" })
            const savedData = await markModel.findOneAndUpdate({ Name: { $regex: Name, $options: "$i" }, Subject: Subject }, { $inc: { Marks: +Marks } }, { new: true });

            return res.status(201).send({ status: true, msg: "done", data: savedData })

        } else {
            const savedData = await markModel.create(req.body)
            return res.status(201).send({ status: true, msg: "done", data: savedData })

        }
    } catch (error) {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
};




const getStudents = async function (req, res) {
    try {
        const teacherId = req.decodedToken.userId;
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).send({ status: false, msg: "Invalid UserID" });
        }
        let obj = {}
        obj.teacher = teacherId;
        obj.isDeleted = false;
        if (req.query.Name) {
            obj.Name = { $regex: req.query.Name, $options: "$i" }
        };
        if (req.query.Subject) {
            obj.Subject = { $regex: req.query.Subject, $options: "$i" }
        }

        const students = await markModel.find(obj);
        if (students.length < 1) return res.status(404).send({ status: false, msg: "No Student Found With The Given Filters" })
        return res.status(200).send({ status: true, data: students })
    } catch (error) {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
};


const getIndividualStudent = async function (req, res) {
    try {
        const teacherId = req.decodedToken.userId;

        const student = await markModel.findOne({ teacher: teacherId, _id: req.params.userId, isDeleted: false });
        if (!student) {
            return res.status(404).send({ status: false, msg: "No Record Found" })
        } else {
            return res.status(201).send({ status: true, data: student })
        }
    } catch {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
}

const updateStudent = async function (req, res) {
    try {
        const { Name, Marks } = req.body;
        let obj = {};
        if (Name != undefined) {
            if (Name.trim().length == 0 || typeof Name != "string" || !/^[a-zA-Z ]*$/.test(Name)) {
                return res.status(400).send({ status: false, msg: "Name Should Be A Non Empty Alphabetical String Only" });
            };
            obj.Name = Name
        };
        if (Marks != undefined) {
            if (typeof Marks != "number" || Marks < 0) {
                return res.status(400).send({ status: false, msg: "Marks Should Be A Positive Number Data Type Only" });
            }
            obj.Marks = Marks
        }

        let updatedStudent = await markModel.findOneAndUpdate({ _id: req.params.userId, isDeleted: false }, { $set: obj }, { new: true });
        if (!updatedStudent) return res.status(400).send({ status: false, msg: "No record found already Deleted" })
        return res.status(200).send({ status: true, data: updatedStudent })
    } catch (error) {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
};


const deleteStudent = async function (req, res) {
    const student = await markModel.findOne({ _id: req.params.userId, isDeleted: false });
    if (!student) return res.status(400).send({ status: false, msg: "No record found already Deleted" })
    const deletedStudent = await markModel.findByIdAndUpdate({ _id: req.params.userId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
    return res.status(200).send({ status: true, data: deletedStudent })
}


module.exports = { createStudent, getStudents, getIndividualStudent, updateStudent, deleteStudent };