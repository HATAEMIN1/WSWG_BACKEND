const express = require("express");
const { default: mongoose } = require("mongoose");
const reviewRouter = express.Router();
const User = require("../models/User");
// const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

//post먼저
reviewRouter.post("/", async (req, res) => {
  try {
    const { content, rating, userId, restId } = req.body;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restId);

    const review = await new Review({ ...req.body, user, restaurant }).save();
    return res.status(200).send({ review });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
//리뷰 리스트
reviewRouter.get("/", async (req, res) => {
  // reviewRouter.get("/restaurant/:restId", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 2;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const review = await Review.find({})
      .populate("user", "name")
      .limit(limit)
      .skip(skip);

    const productsTotal = await Review.countDocuments();
    const hasMore = skip + limit < productsTotal ? true : false;

    // const reviewsTotal = await Review.countDocuments();
    // const hasMore = skip + limit < reviewsTotal;

    return res.status(200).send({ review, hasMore });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//리뷰 뷰페이지
reviewRouter.get("/:rpId", async (req, res) => {
  try {
    const { rpId } = req.params;
    if (!mongoose.isValidObjectId(rpId))
      res.status(400).send({ message: "not rpId" });

    const review = await Review.findById({ _id: rpId }).populate({
      path: "user",
      select: "name",
    });

    if (!review) {
      return res.status(404).send({ message: "Review not find" });
    }

    return res.status(200).send({ review });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

//리뷰 뷰 삭제
reviewRouter.delete("/:rpId", async (req, res) => {
  try {
    const { rpId } = req.params;
    const deleteReview = await Review.findByIdAndDelete(rpId);

    if (!deleteReview) {
      return res.status(404).send({ message: "review not find" });
    }

    return res.status(200).send({ message: "리뷰가 삭제되었습니다!" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = reviewRouter;
