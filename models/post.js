const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  text: String,
  imageId: String,
  imageName: String,
  authorName: String,
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
