import mongoose, { model, Types } from "mongoose";

const TagSchema = mongoose.Schema({
  name: String,
  review: {
    type: Types.ObjectId,
    ref: "Review",
  },
});
const Tag = model("tag", TagSchema);
module.exports = Tag;
