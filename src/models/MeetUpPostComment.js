const mongoose = require("mongoose");
const { Types } = require("mongoose");

const meetUpPostCommentSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "user" },
    meetUpPost: { type: Types.ObjectId, ref: "meetUpPost" },
  },
  { timestamps: true }
);

const MeetUpPostComment = mongoose.model(
  "MeetUpPostComment",
  meetUpPostCommentSchema
);
module.exports = MeetUpPostComment;
