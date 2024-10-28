require("dotenv").config();
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT_APP || 3010;
const serverOptions = {
    cert: fs.readFileSync("server.crt", "utf8"),
    key: fs.readFileSync("server.key", "utf8"),
};
var serverHttps = https.createServer(serverOptions, app);

const indexRouter = require('./routes/index');
const patientRouter = require('./routes/patient');
const doctorRouter = require('./routes/doctor');



//middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set("view engine", "ejs");

//route
app.use('/', indexRouter);
app.use('/patient', patientRouter);
app.use('/doctor', doctorRouter);

serverHttps.listen(PORT, () => {
    console.log('app listening on port ' + PORT);
})