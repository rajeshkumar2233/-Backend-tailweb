const teacherModel = require("../models/teacherModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { isValidRequestBody, isValidEmail, isValidPass, isValidName } = require("../validator/validation")


const createUser = async (req, res) => {
  try {
    const data = req.body;
    let { name, email, password } = data;
   if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "teachers details are required." });
    }
     if (!name)
      return res.status(400).send({ status: false, message: "Please Enter Your Name" });
    if (!isValidName(name))
      return res.status(400).send({ status: false, message: "Please Enter Valid Name" });

    if (!email)
      return res.status(400).send({ status: false, msg: "Please Enter your Email Id" });
    if (!isValidEmail(email))
      return res.status(400).send({ status: false, msg: "Please Enter a valid Email Id." });

    let emailExited = await teacherModel.findOne({ email: email });
    if (emailExited)
      return res.status(400).send({ status: false, msg: "This Email already existed, Please Try another !" });

    if (Object.keys(data).some(a => a === "password")) {
      if (!password)
        return res.status(400)
          .send({ status: false, message: "Enter Value in password Field " })

      if (!isValidPass(password))
        return res.status(400).send({ status: false, message: "Password must contain at least 8 digit containing with one capital letter, small letter, number and special symbol" })

      //-------------------password hashing-------------------

      const hashPassword = await bcrypt.hash(password, 10);
      data.password = hashPassword
    }
      let newTeacher = {
      name: data.name,
      email: data.email,
      password: data.password,
      isDeleted: data.isDeleted,
    };

    await teacherModel.create(newTeacher);

    return res.status(201).send({ status: true, data: newTeacher });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//=======================userLogin Api=======================>>>>>

const userLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide email and password." });
    }

    if (!email) {
      return res.status(400).send({ status: false, message: "Email must be present" });
    }
    if (!isValidEmail(email))
      return res.status(400).send({ status: false, msg: "Please Enter a valid Email Id." });

    if (!password) {
      return res.status(400).send({ status: false, message: "Password must be present" });
    }
    if (!isValidPass(password))
      return res.status(400).send({ status: false, message: "Password must contain at least 8 digit containing with one capital letter, small letter, number and special symbol" })

     let checkEmail = await teacherModel.findOne({ email: email });
    if (!checkEmail) {
      return res.status(401).send({ status: false, message: "Please provide a correct Email" });
    }

    let checkPassword = await bcrypt.compare(password, checkEmail.password);
    if (!checkPassword) {
      return res.status(401).send({ status: false, message: "please provide a correct password" });
    }

    let token = jwt.sign({
      teacherId: checkEmail._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, //expires in 24 hr
    }, "Project");
    res.setHeader("x-api-key", token);

    return res.status(200).send({ status: true, message: "User Login Successful", data: { teacherId: checkEmail._id, token: token }, });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};



module.exports = { createUser, userLogin };