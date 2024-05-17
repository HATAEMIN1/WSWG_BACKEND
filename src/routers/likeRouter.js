const express = require("express");
const likeRouter = express.Router();
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Like = require("../models/Like");

likeRouter.post("/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const { userId } = req.body;
    console.log(userId);
    const restaurant = await Restaurant.findById({ _id: rtId });
    const user = await User.findById({ _id: userId });
    const like = await new Like({
      restaurant,
      user,
      createdAt: new Date(),
    }).save();
    res.status(200).send({ like });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
likeRouter.delete("/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    console.log(req.body);
    const { userId } = req.body;
    console.log(userId);
    await Like.deleteOne({
      user: userId,
      restaurant: rtId,
    });
    res.status(200).send("좋아요가 취소");
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
likeRouter.get("/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const likeCount = await Like.find({ restaurant: rtId }).countDocuments();
    res.status(200).send({ likeCount });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
module.exports = likeRouter;
