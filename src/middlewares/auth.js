const jwt = require("jsonwebtoken");
const studentMarkModel = require("../models/studentMarkModel");
const mongoose = require("mongoose")
const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) return res.status(400).send({ status: false, msg: "Token is not present for authentication" });
        jwt.verify(token, "dell12345", (error, decodedToken) => {
            if (error) {
                return res.status(403).send({ status: false, msg: "Token is Invalid" })
            }
            else {
                req.decodedToken = decodedToken
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({ message: "error", error: err.message })
    }
};

const authorization = async function (req, res, next) {
    let studentId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).send({ status: false, msg: "Invalid UserID" });
    }
    const student = await studentMarkModel.findOne({ teacher: req.decodedToken.userId, _id: studentId });
    if (!student) {
        return res.status(401).send({ status: false, msg: "Unauthorised" })
    } else {
        next();
    }
}






module.exports = { authentication, authorization }