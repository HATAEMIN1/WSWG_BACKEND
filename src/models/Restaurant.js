const mongoose = require("mongoose");
const { Types } = require("mongoose");

const restaurantSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true, unique: true },
  image: [{ originalname: { type: String }, filename: { type: String } }],
  category: {
    foodtype: { type: String, required: true },
    mateType: { type: String, required: true },
  },
  rating: { type: Number },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  like: {
    type: Types.ObjectId,
    ref: "like",
  },
});
const Restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = Restaurant;
