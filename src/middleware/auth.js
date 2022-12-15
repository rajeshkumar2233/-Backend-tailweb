const jwt = require("jsonwebtoken");
const teacherModel = require("../models/teacherModel");
const { isValidObjectId } = require("mongoose");
//===========================Authorization=============================//
const authentication = async function (req, res, next) {
  try {
    let bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
      return res.status(400).send({status: false,Error: "Enter Token In BearerToken !!!"});
    }

    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    if (!bearerToken) {
      return res.status(403).send({status: false,message: "invalid token"});
    }
    // To verify the token, we are using error handling callback function
    jwt.verify(bearerToken, "Project", function (err, decoded) {
      if (err) {
        return res.status(401).send({status: false,message: "Authentication Failed"});
      } else {
        req.tokenData = decoded; //Attribute to store the value of decoded token
        next();
      }
    });
  } catch (err) {
    console.log("this error is from token validation", err.message);
    res.status(500).send({msg: err.message});
  }
};

//===========================Authorization=============================//

const authorization = async function (req, res, next) {
  try {
    let teacherLoggedIn = req.tokenData; //Accessing userId from token attribute
    req.teacherId = req.params.teacherId; // pass user id in path params
    //check if user id is valid or not
    
    if (!isValidObjectId(req.teacherId)) {
      return res.status(400).send({status: false,message: "userId is invalid"});
    }
    let teacherAccessing = await teacherModel.findById(req.teacherId);
    if (!teacherAccessing) {
      return res.status(404).send({status: false,message: "Error! Please check userid and try again",
      });
    }

    if (req.teacherId !== teacherLoggedIn.teacherId) {
      return res.status(403).send({status: false,msg: "Error, authorization failed"});
    }
    next();
  } catch (err) {
    res.status(500).send({status: false, error: err.message});
  }
};

module.exports = {authentication, authorization};