const express = require("express");
const likeRouter = express.Router();
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Like = require("../models/Like");

likeRouter.post("/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ error: "userId is required" });
    }

    const restaurant = await Restaurant.findById({ _id: rtId });
    const user = await User.findById({ _id: userId });
    const like = await new Like({
      restaurant,
      user,
      liked: true,
      createdAt: new Date(),
    }).save();
    res.status(200).send({ like });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
//좋아요한 레스토랑을 가져오는 라우터 추가
likeRouter.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({ error: "userId is required" });
    }
    //userId로 좋아요 정보를 찾음
    const likes = await Like.find({ user: userId, liked: true }).populate(
      "restaurant"
    );
    //좋아요 정보에서 레스토랑 세부사항 추출
    const likedRestaurants = likes.map((like) => like.restaurant);

    res.status(200).send({ likedRestaurants });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

likeRouter.delete("/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ error: "userId is required" });
    }

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
    const { userId } = req.query;
    let like = [];
    if (userId) {
      like = await Like.find({ restaurant: rtId, user: userId });
    }
    const likeCount = await Like.find({ restaurant: rtId }).countDocuments();
    res.status(200).send({ likeCount, like });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

module.exports = likeRouter;
