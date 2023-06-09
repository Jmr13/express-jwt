const dotenv = require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require('path');

const router = require("./routes");
const AppError = require("./utils/appError");
const errorHandler = require("./utils/errorHandler");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use("/api", router);

app.all("*", (req, res, next) => {
  next(new AppError(`The URL ${req.originalUrl} does not exists`, 404));
});

app.listen(process.env.DB_PORT, () => {
  console.log(`server running on port ${dotenv.DB_PORT}`);
});

module.exports = app;