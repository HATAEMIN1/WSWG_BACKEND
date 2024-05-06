const mongoose = require("mongoose");
const { model, Types } = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 15,
  },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 4 },
  role: { type: Number, default: 0 },
  image: [{ originalname: { type: String }, filename: { type: String } }],
  createdAt: Date,
  authProvider: String,
  like: {
    type: Types.ObjectId,
    ref: "like",
  },
});
const User = model("user", userSchema);
module.exports = User;
