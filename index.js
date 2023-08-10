const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const connectDB = require("./database/dbConn");
const authRouter = require('./routes/auth.route');
const notFound = require("./middlewares/notFound");

const app = express();
connectDB();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/api/healthchecker", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to Two-Factor Authentication with Node.js",
    });
});

app.use('/api/auth', authRouter);

app.use(notFound);

const port = process.env.PORT || 3000;
mongoose.connection.once("open", () => {
    console.log("connected to DB");
    app.listen(port, () => {
      console.log(`connected to backend - ${port}`);
    });
});

