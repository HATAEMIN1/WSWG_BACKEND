import mongoose, { model, Types } from "mongoose";

const likeSchema = mongoose.Schema({
  created: Date,
  user: { type: Types.ObjectId, ref: "user", required: true },
  restaurant: { type: Types.ObjectId, ref: "restaurant" },
});
const Like = model("like", likeSchema);
module.exports = Like;
