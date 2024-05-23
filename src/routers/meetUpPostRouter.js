const express = require("express");
const { default: mongoose } = require("mongoose");
const meetUpPostRouter = express.Router();
const User = require("../models/User");
const MeetUpPost = require("../models/MeetUpPost");

meetUpPostRouter.post("/", async (req, res) => {
  try {
    const { title, content, latitude, longitude, chatLink, userId } = req.body;

    // if (typeof title !== "string") {
    //   return res.status(400).send({ err: "title is required" });
    // }
    // if (typeof content !== "string") {
    //   return res.status(400).send({ err: "content is required" });
    // }
    // if (typeof latitude !== "number") {
    //   return res.status(400).send({ err: "latitude is required" });
    // }
    // if (typeof longitude !== "number") {
    //   return res.status(400).send({ err: "longitude is required" });
    // }
    // if (typeof chatLink !== "string") {
    //   return res.status(400).send({ err: "chatlink is required" });
    // }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).send({ err: "userId is required" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(402).send({ err: "user does not exist" });
    }

    let meetUpPost = await new MeetUpPost({ ...req.body, user }).save();
    return res.status(200).send({ meetUpPost });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

meetUpPostRouter.get("/", async (req, res) => {
  try {
    const meetUpPost = await MeetUpPost.find({});
    return res.status(200).send({ meetUpPost });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

meetUpPostRouter.get("/:mpId", async (req, res) => {
  try {
    const { mpId } = req.params;
    if (!mongoose.isValidObjectId(mpId))
      res.status(400).send({ message: "not mpId" });

    const meetUpPost = await MeetUpPost.findOne({ _id: mpId }).populate({
      path: "user",
      select: "email name",
    });
    return res.status(200).send({ meetUpPost });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

meetUpPostRouter.delete("/:mpId", async (req, res) => {
  try {
    const { mpId } = req.params;
    const deletedMeetUpPost = await MeetUpPost.findByIdAndDelete(mpId);

    if (!deletedMeetUpPost)
      return res.status(400).send({ message: "mpId is 없음" });
    return res.status(200).send({ message: "우리지금만나가 삭제되었습니다." });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});
module.exports = meetUpPostRouter;
