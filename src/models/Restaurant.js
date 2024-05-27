const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: {
    metropolitan: { type: String },
    city: { type: String },
    district: { type: String },
    detailedAddress: { type: String },
  },
  image: [{ type: String }],
  category: {
    foodType: { type: String },
    mateType: { type: String },
  },
  views: { type: Number, default: 0 },
  rating: { type: Number },
  location: {
    type: {
      type: String,
      enum: ["Point"], // 위치 타입은 'Point'로 제한
      default: "Point", // GeoJSON 타입은 기본적으로 'Point'로 설정
    },
    coordinates: {
      type: [Number], // 경도와 위도를 순서대로 배열로 저장 (GeoJSON 형식)
      index: "2dsphere", // GeoJSON 인덱스 생성 (지리적 위치 검색을 위해)
    },
  },
});

restaurantSchema.index({
  name: "text",
  location: "2dsphere",
});
const Restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = Restaurant;
