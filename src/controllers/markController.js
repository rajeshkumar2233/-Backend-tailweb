const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teacherModel");
const { isValidRequestBody, isValidName, isValidMarks } = require("../validator/validation");
const { isValidObjectId } = require("mongoose");


const filledMarks = async (req, res) => {
  try {
    let { name, data } = req.body;
    let { subject, marks } = data;
  if (data.length === 0) {
      return res.status(400).send({ status: false, message: "fill students subject and marks data" });
    }
    if (!isValidObjectId(req.teacherId)) {
      return res.status(400).send({ status: false, message: " Please!! input a valid Id :(" });
    }

    if (!name)
      return res.status(400).send({ status: false, message: "Please Enter student Name" });

    if (!isValidName(name))
      return res.status(400).send({ status: false, message: "Please Enter Valid Name" });

    let findStudent = await studentModel.findOne({ name: name });

    if (findStudent) {
      return res.status(400).send({ status: false, message: "Student Exists!!" });
    }

    let checkMark = data.every((markObj) => (/[0-9]/).test(markObj.marks))

    // if (checkMark == false)
    //   return res.status(400).send({ status: false, message: "Please Enter Valid  marks" });

    // if (!subject)
    //   return res.status(400).send({ status: false, message: "Please Enter subject" });

    // if (!isValidName(subject))
    //   return res.status(400).send({ status: false, message: "Please Enter Valid subject Name" });


    // if (!isValidMarks(marks))
    //   return res.status(400).send({ status: false, message: "Please Enter Valid marks" });

    let Obj = {
      teacherId: req.teacherId,
      name: name,
      data: data,
    }

    let studentMarks = await studentModel.create(Obj)
    return res.status(201).send({ status: true, message: studentMarks });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//==================================================================================================================================================================================

const updateStudent = async function (req, res) {
  try {


    let studentId = req.params.studentId;
    let { name, data } = req.body;

    let query = {}

    //validate the teacher Id
    if (!isValidObjectId(studentId)) {
      return res.status(400).send({ status: false, message: " Please!! input a valid Student Id :(" });
    }

    //find the student with the given id
    const studentExist = await studentModel.findOne({ _id: studentId })

    //if the student does not exist
    if (!studentExist) {
      return res.status(404).send({ status: false, message: " student does not exist" })
    }

    //check if right teacher is entering the right student marks
    if (studentExist.teacherId != req.teacherId) {
      return res.status(404).send({ status: false, message: "studentId and teacher id does not match" })
    }

    if (!name && !data) {
      return res.status(400).send({ status: false, message: "Please Enter Data For Update" });
    }

    //if the teacher is updating the name of the student .
    if (name) {
      if (!isValidName(name))
        return res.status(400).send({ status: false, message: "Please Enter Valid Name" });

      query.name = name
    }

    if (data) {
      //if theacher is entering the marks of the subject that is already entered
      if (data.length != 0) {
           let checkMark = data.every((markObj) => (/[0-9]/).test(markObj.marks))
         if (checkMark == false)
          return res.status(400).send({ status: false, message: "Please Enter Valid  marks" });
         //if user is enterig more than one subject from the body
        if (data.length > 1) return res.status(400).send({ status: false, message: "Please enter subject one by one to update" })
        let { subject, marks } = data[0];
        if (subject && marks) { //for checking if the subject aleady exist in the data
          const subjectExist = studentExist.data.findIndex(data => data.subject == subject);
          console.log(subjectExist)

          if (subjectExist != -1) {
            //if subject already exist the increment the marks of the partiuclar subject
            const increaseMarks = await studentModel.findOneAndUpdate({ _id: studentId, "data.subject": subject },
              { $inc: { "data.$.marks": +marks } }, { new: true });
          }
          else {  //if the subject does not exist then concat the previous previous array with new array
            query.data = studentExist.data.concat(req.body.data)

          }

        }

      }
    }

    let updatedStudent = await studentModel.findOneAndUpdate({ _id: studentId }, query, { new: true })

    return res.status(200).send({ status: true, message: "Student details updated successfully", data: updatedStudent })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }

}

//_______________________________________query students____________________________________________


const getStudent = async function (req, res) {
  try {
    let filter = { isDeleted: false }
    if (req.query.subject) {

      filter["data.subject"] = req.query.subject;
    }
    if (req.query.name) {
      filter.name = req.query.name
    }
    let marksGreaterThan = req.query.marksGreaterThan
    let marksLessThan = req.query.marksLessThan

    if (marksGreaterThan && marksLessThan) {
      if (((/[a-zA-Z]/).test(marksGreaterThan)) || ((/[a-zA-Z]/).test(marksLessThan)))
        return res.status(400).send({ status: false, message: "Please Enter Valid  marks" })
      filter["data.marks"] = { $gt: Number(req.query.marksGreaterThan), $lte: Number(req.query.marksLessThan) }
    }

    else if (marksGreaterThan) {
      if ((/[a-zA-Z]/).test(marksGreaterThan))
        return res.status(400).send({ status: false, message: "Please Enter Valid Marks" })
      filter["data.marks"] = { $gt: Number(req.query.marksGreaterThan) }

    } else if (marksLessThan) {
      if ((/[a-zA-Z]/).test(marksLessThan))
        return res.status(400).send({ status: false, message: "Please Enter Valid  Marks" })
      filter["data.marks"] = { $lt: Number(req.query.marksLessThan) }
    };


    console.log(filter)
    const getStudent = await studentModel.find(filter)

    return res.status(200).send({ status: true, message: "Here are the requireddetais of students", length: getStudent.length, data: getStudent })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }

}

//____________________________________deleted_______________________________

const deleteStudent = async function (req, res) {
  try {


    let studentId = req.params.studentId;

    const studentExist = await studentModel.findOne({ _id: studentId }, { isDeleted: false })
    if (!studentExist)
      return res.status(400).send({ status: false, message: "student deleted alresdy" })

    if (studentExist.teacherId != req.teacherId) {
      return res.status(404).send({ status: false, message: "studentId and teacher id does not match" })
    }

    let deletedStudent = await studentModel.findOneAndUpdate({ _id: studentId, teacherId: req.teacherId }, { $set: { isDeleted: true } }, { new: true })

    return res.status(200).send({ status: true, message: "student deleted successfully", data: deletedStudent })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }

}



module.exports = { filledMarks, updateStudent, getStudent, deleteStudent };