const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ViewSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("View", ViewSchema);
