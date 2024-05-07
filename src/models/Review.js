const { mongoose, Types } = require("mongoose");

const reviewSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number, required: true },
  image: [{ originalname: { type: String }, filename: { type: String } }],
  rating: { type: Number, required: true },
  createdAt: Date,
  user: { type: Types.ObjectId, ref: "User" },
  restaurant: { type: Types.ObjectId, ref: "Restaurant" },
});
const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
