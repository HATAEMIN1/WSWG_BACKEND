import mongoose, { Types } from "mongoose";

const meetUpPostCommentSchema = mongoose.Schema({
  content: { type: String, required: true },
  user: { type: Types.ObjectId, ref: "user" },
  meetUpPost: { type: Types.ObjectId, ref: "meetUpPost" },
});

const MeetUpPostComment = mongoose.model(
  "MeetUpPostComment",
  meetUpPostCommentSchema
);
module.exports = MeetUpPostComment;
