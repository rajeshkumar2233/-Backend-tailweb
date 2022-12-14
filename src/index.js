const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const route = require("./routes/route")
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://rajeshkumar2233:9691501076Rj@cluster0.mrghs.mongodb.net/webBackend?retryWrites=true&w=majority", {
    useNewUrlParser: true
}).then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});