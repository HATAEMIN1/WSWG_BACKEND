const mongoose = require("mongoose");
const { Types } = require("mongoose");

const meetUpPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  chatLink: { type: String, required: true, unique: true },
  user: { type: Types.ObjectId, ref: "user", required: true },
  createdAt: Date,
});
const MeetUpPost = mongoose.model("meetUpPost", meetUpPostSchema);
module.exports = MeetUpPost;
