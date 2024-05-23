const mongoose = require("mongoose");
const { Types } = require("mongoose");

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
    foodtype: { type: String },
    mateType: { type: String },
  },
  views: { type: Number, default: 0 },
  rating: { type: Number },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  like: {
    type: Types.ObjectId,
    ref: "like",
  },
});

restaurantSchema.index({
  name: "text",
});
const Restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = Restaurant;
