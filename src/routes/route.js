const express = require('express');
const router = express.Router();
const userController = require("../controllers/teacherController");
const markController = require("../controllers/markController");
const authentication = require("../middleware/auth")



router.post('/createUser', userController.createUser);

router.post('/userLogin', userController.userLogin);

router.post('/filledMarks/:teacherId', authentication.authentication, authentication.authorization, markController.filledMarks);

router.put("/updatestudent/:teacherId/:studentId", authentication.authentication, authentication.authorization, markController.updateStudent)

router.get("/getStudents/:teacherId", authentication.authentication, markController.getStudent)

router.delete("/deleteStudents/:teacherId/:studentId", authentication.authentication, authentication.authorization, markController.deleteStudent)




//API for wrong route-of-API
router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Path Not Found",
  });
});






module.exports = router;