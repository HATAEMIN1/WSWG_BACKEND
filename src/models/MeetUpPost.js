import mongoose, { model } from "mongoose";

const meetUpPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  chatLink: { type: String, required: true, unique: true },
  createdAt: Date,
});
const MeetUpPost = model("meetUpPost", meetUpPostSchema);
module.exports = MeetUpPost;
