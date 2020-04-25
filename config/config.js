require("dotenv").config();

process.env.PORT = process.env.PORT || 3001;

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

process.env.JWT_EXPIRES_IN = 60 * 60 * 24 * 10;

let dbURL;

if (process.env.NODE_ENV === "dev") {
  dbURL = "mongodb://localhost:27017/picShareDB";
} else {
  dbURL = process.env.MONGODB_URL;
}

process.env.CONNECTION_STRING = dbURL;
