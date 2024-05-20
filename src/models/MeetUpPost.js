const mongoose = require("mongoose");
const { Types } = require("mongoose");

const meetUpPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  chatLink: { type: String },
  user: { type: Types.ObjectId, ref: "user", required: true },
  createdAt: Date,
});
const MeetUpPost = mongoose.model("meetUpPost", meetUpPostSchema);
module.exports = MeetUpPost;
