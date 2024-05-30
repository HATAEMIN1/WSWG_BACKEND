const express = require("express");
const { default: mongoose } = require("mongoose");
const reviewRouter = express.Router();
const User = require("../models/User");
// const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
// const Tag = require("../models/Tag");
const { upload } = require("../middlewares/imageUpload");

// 리뷰 생성
reviewRouter.post("/", async (req, res) => {
  try {
    const { userId, restId, title, content, images, rating, hashTag } = req.body;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restId);

    if (!user || !restaurant) {
      return res.status(404).send({ message: "User or Restaurant not found" });
    }

    const review = new Review({
      title,
      content,
      images,
      rating,
      hashTag,
      user: user._id,
      restaurant: restaurant._id,
      createdAt: new Date(),
    });

    await review.save();
    return res.status(200).send({ review });
  } catch (error) {
    console.log("Error saving review:", error);
    res.status(500).send({ error: error.message });
  }
});




// 이미지 업로드
reviewRouter.post("/image", upload.single("image"), async (req, res) => {
  try {
    return res.send(req.file.filename);
  } catch (error) {
    console.log(error.message);
  }
});
//--------------------------------------------------------->

// 특정 레스토랑의 리뷰 리스트 가져오기
reviewRouter.get("/restaurant/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const reviews = await Review.find({ restaurant: rtId })
      .populate("user", "name")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const reviewsTotal = await Review.countDocuments({ restaurant: rtId });
    const hasMore = skip + limit < reviewsTotal;

    return res.status(200).send({ reviews, hasMore });
  } catch (error) {
    console.error("Error fetching reviews for restaurant:", error);
    return res.status(500).send({ error: error.message });
  }
});

// 해시태그 및 일반 텍스트 검색 라우터
reviewRouter.get('/search', async (req, res) => {
  try {
    const { hashtag, q } = req.query;
    let query = {};

    if (hashtag) {
      query.hashTag = { $regex: hashtag, $options: 'i' };
    } else if (q) {
      query.content = { $regex: q, $options: 'i' };
    } else {
      return res.status(400).send({ message: 'Hashtag or query is required' });
    }

    console.log('Search query:', query);

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('restaurant', 'name');

    if (reviews.length === 0) {
      return res.status(404).send({ message: 'No reviews found for this query' });
    }

    return res.status(200).send(reviews);
  } catch (error) {
    console.error('Error searching reviews:', error);
    return res.status(500).send({ error: error.message });
  }
});


// 전체 리뷰 리스트 가져오기
reviewRouter.get("/", async (req, res) => {
  try {
    const { limit = 5, skip = 0 } = req.query;
    const reviews = await Review.find()
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("user", "name")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    const reviewsTotal = await Review.countDocuments();
    const hasMore = skip + limit < reviewsTotal;

    return res.status(200).send({ reviews, hasMore });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).send({ error: error.message });
  }
});


// 리뷰 뷰페이지
reviewRouter.get("/:rpId/view", async (req, res) => {
  const { rpId } = req.params;
  console.log(rpId);
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

// 새로운 라우터 추가: 특정 사용자가 작성한 모든 리뷰 가져오기
reviewRouter.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId }).populate("restaurant", "name");
    if (!reviews) {
      return res.status(404).send({ message: "Reviews not found" });
    }
    return res.status(200).send({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});


// 리뷰 삭제
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

//리뷰 이미지데이터 삭제

module.exports = reviewRouter;
