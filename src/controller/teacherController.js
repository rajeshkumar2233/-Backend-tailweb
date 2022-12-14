const teacherModel = require("../models/teacherModel");
const validator = require("validator")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const createTeacher = async function (req, res) {
    try {
        if (Object.keys(req.body).length < 1) return res.status(400).send({ status: false, msg: "Request Body Cant Be Empty" });
        const { name, email, mobile, password } = req.body;
        if (!name || typeof name != "string" || !/^[a-zA-Z ]*$/.test(name)) {
            return res.status(400).send({ status: false, msg: "Name Is A Mandatory Field And  It Should Be A Alphabetical String Only" });
        };
        if (!email || !validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: "Email Is A Mandatory Field And  It Should Be A Valid EmailID" });
        };
        const duplicateEmailMobile = await teacherModel.findOne({ $or: [{ email: email }, { mobile: mobile }] });

        if (duplicateEmailMobile) {
            if (duplicateEmailMobile.email == email) {
                return res.status(400).send({ status: false, msg: "Email Already Exists,Please Input Another EmailID" })
            } else if (duplicateEmailMobile.mobile == mobile) {
                return res.status(400).send({ status: false, msg: "Mobile Already Exists,Please Input Another Mobile Number" })

            }
        }
        if (!mobile || typeof mobile != "number" || !/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).send({ status: false, msg: "Mobile Is A Mandatory Field And Should Be A Valid Indian Mobile Number" });
        };
        if (!password || !validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, msg: "Password Is A Mandatory Field And Should Be Minimum 8 Characters with One UpperCase,one Lowercase,one number and One Symbol" });
        }

        const hash = await bcrypt.hash(password, 10);
        req.body.password = hash

        const savedTeacher = await teacherModel.create(req.body);
        return res.status(201).send({ status: true, msg: "Teacher Created SuccessFully" })
    }
    catch (error) {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
}





const login = async function (req, res) {
    try {
        if (Object.keys(req.body).length < 1) return res.status(400).send({ status: false, msg: "Request Body Cant Be Empty" });
        const { email, password } = req.body;
        if (!email) return res.status(400).send({ status: false, msg: "Please Provide Email" });
        if (!password) return res.status(400).send({ status: false, msg: "Please Provide Password" });

        let loggedInUser = await teacherModel.findOne({ email: email });
        if (!loggedInUser) return res.status(400).send({ status: false, msg: "Please Confirm Your EmailId" });
        let hash = loggedInUser.password;

        bcrypt.compare(password, hash, (err, result) => {
            if (result) {
                let token = jwt.sign({ userId: loggedInUser._id }, "zandubalm", { expiresIn: "1h" });
                return res.status(200).send({ status: true, msg: "LoggedIn SuccessFully", data: token })

            } else {
                return res.status(400).send({ status: false, msg: "Please Confirm Your Password,Its Incorrect" })

            }
        })

    } catch (error) {
        if (error) {
            return res.status(500).send({ status: false, msg: error.message })
        }
    }
}




module.exports = { createTeacher, login }


