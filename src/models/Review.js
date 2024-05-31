const { mongoose, Types } = require("mongoose");

// Review 스키마 정의
const reviewSchema = mongoose.Schema({
  content: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: Types.ObjectId, ref: "user" },
  restaurant: { type: Types.ObjectId, ref: "restaurant" },
  tags: [{ type: Types.ObjectId, ref: "Tag" }], // 해시태그 참조로 변경
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
