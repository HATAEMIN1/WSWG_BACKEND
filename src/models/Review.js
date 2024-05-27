const { mongoose, Types } = require("mongoose");

const reviewSchema = mongoose.Schema({
  content: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, required: true },
  createdAt: Date,
  user: { type: Types.ObjectId, ref: "user" },
  restaurant: { type: Types.ObjectId, ref: "restaurant" },
  hashTag: [{ type: String }],
});
const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
