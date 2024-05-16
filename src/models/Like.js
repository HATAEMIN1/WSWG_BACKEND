const mongoose = require("mongoose");
const { Types } = require("mongoose");

const likeSchema = mongoose.Schema({
  created: Date,
  user: { type: Types.ObjectId, ref: "user" },
  restaurant: { type: Types.ObjectId, ref: "restaurant" },
});
const Like = mongoose.model("like", likeSchema);
module.exports = Like;
