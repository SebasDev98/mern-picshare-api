const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: [true, "User Name is required"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Passoword is required"],
  },
  img: { type: String, required: false },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.toJSON = function () {
  let userObject = this.toObject();

  delete userObject.password;

  return userObject;
};

module.exports = mongoose.model("User", UserSchema);
