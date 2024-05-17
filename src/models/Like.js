const mongoose = require("mongoose");
const { Types } = require("mongoose");

const likeSchema = mongoose.Schema({
  user: { type: Types.ObjectId, ref: "user" },
  liked: { type: Boolean, default: false },
  restaurant: { type: Types.ObjectId, ref: "restaurant" },
  createdAt: Date,
});
const Like = mongoose.model("like", likeSchema);
module.exports = Like;
