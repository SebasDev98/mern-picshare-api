require("./config/config");
const express = require("express");
const postRouter = require("./routes/post");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const whitelist = ["http://localhost:3000", "http://example2.com"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const app = express();

const morgan = require("morgan");

app.use(morgan("dev"));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve(__dirname, "./../uploads/"),
  })
);
// parse application/json
app.use(bodyParser.json());

app.use(require("./routes/index"));

mongoose.connect(
  process.env.CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err, res) => {
    if (err) throw err;

    console.log("Database Connected");
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Listening the port ${process.env.PORT}`);
});
