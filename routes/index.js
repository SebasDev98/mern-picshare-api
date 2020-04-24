const express = require("express");

const app = express();

app.use("/user", require("./auth"));
app.use("/post", require("./post"));
app.use("/assets/images", require("./images"));
module.exports = app;
