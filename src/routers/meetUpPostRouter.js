const express = require("express");
const meetUpPostRouter = express.Router();
const MeetUpPost = require("../models/MeetUpPost");

meetUpPostRouter.post("/", async (req, res) => {
  try {
    const { title, content, longitude, latitude, chatlink } = req.body;
    // const user = await User.findById(userId);
    // if (!user) res.status(400).send({ err: "user does not" });
    let meetUpPost = await new MeetUpPost(req.body).save();
    return res.status(200).send({ meetUpPost });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
module.exports = meetUpPostRouter;