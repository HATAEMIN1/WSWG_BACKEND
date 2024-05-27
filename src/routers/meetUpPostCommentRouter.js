const { Router } = require("express");
const meetUpPostCommentRouter = Router({ mergeParams: true });
const { default: mongoose } = require("mongoose");
const MeetUpPost = require("../models/MeetUpPost");
const User = require("../models/User");
const MeetUpPostComment = require("../models/MeetUpPostComment");

meetUpPostCommentRouter.post("/", async (req, res) => {
  try {
    const { mpId } = req.params;
    const { userId, content } = req.body;

    if (!mongoose.isValidObjectId(mpId))
      return res.status(400).send({ message: "mpId is 없음" });
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ message: "userId is 없음" });
    if (typeof content !== "string")
      return res.status(400).send({ message: "내용이 없네~~~" });

    const [meetUpPost, user] = await Promise.all([
      MeetUpPost.findById(mpId),
      User.findById(userId),
    ]);
    const comment = await new MeetUpPostComment({
      content,
      meetUpPost: mpId,
      user: userId,
    }).save();
    return res.status(200).send({ comment });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

meetUpPostCommentRouter.get("/", async (req, res) => {
  try {
      const { mpId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!mongoose.isValidObjectId(mpId))
          return res.status(400).send({ message: "mpId is 없음" });

      const skip = (page - 1) * limit;

      // 전체 댓글 수를 가져옵니다.
      const totalComments = await MeetUpPostComment.countDocuments({ meetUpPost: mpId });

      const comments = await MeetUpPostComment.find({ meetUpPost: mpId })
          .populate([{ path: "user", select: "name" }])
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(Number(limit));

      console.log("응답 데이터:", { comments, totalComments });

      return res.status(200).send({ comments, totalComments });
  } catch (error) {
      return res.status(400).send({ error: error.message });
  }
});

meetUpPostCommentRouter.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await MeetUpPostComment.findByIdAndDelete(commentId);
    if (!deletedComment)
      return res.status(400).send({ message: "commentId is 없음" });
    return res
      .status(200)
      .send({ message: "댓글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = meetUpPostCommentRouter;
