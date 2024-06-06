const { mongoose, Schema } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 4,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: {
    // single image so {} without []
    filename: { type: String, default: "noimage.jpg" },
    originalname: { type: String, default: "noimage.jpg" },
  },
  createdAt: Date,
  authProvider: String,
});
const User = mongoose.model("user", userSchema);
module.exports = User;
