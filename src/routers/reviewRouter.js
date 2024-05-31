const express = require("express");
const { default: mongoose } = require("mongoose");
const reviewRouter = express.Router();
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Tag = require("../models/Tag");
const { upload } = require("../middlewares/imageUpload");

// 리뷰 생성 라우터
reviewRouter.post("/", async (req, res) => {
  try {
    const { userId, restId, content, images, rating, tags } = req.body;

    // 요청 데이터 로그
    console.log("Request body:", req.body);

    // 필수 필드 검증
    if (!userId || !restId || !content || !rating) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const restaurant = await Restaurant.findById(restId);
    if (!restaurant) {
      return res.status(404).send({ error: "Restaurant not found" });
    }

    const review = new Review({
      user: user._id,
      restaurant: restaurant._id,
      content: content,
      images: images,
      rating: rating,
      createdAt: new Date(),
    });

    if (tags && tags.length > 0) {
      for (let tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ name: tagName });
          await tag.save();
        }
        review.tags.push(tag._id);
      }
    }

    await review.save();
    return res.status(200).send({ review });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

//이미지--------------------------------------------------->
reviewRouter.post("/image", upload.single("image"), async (req, res) => {
  //talend에서확인할때 'Form'으로설정, name이↑이거랑같아야함
  try {
    // console.log(req.file);
    // const review = await new Review({
    //   originalFileName: req.file.originalname,
    //   key: req.file.filename,
    // });
    return res.send(req.file.filename); //key값만 받음
  } catch (error) {
    console.log(error.message);
  }
});
// 해시태그 추가 라우터
reviewRouter.post("/tags", async (req, res) => {
  try {
    const { name } = req.body;
    let tag = await Tag.findOne({ name });
    if (!tag) {
      tag = new Tag({ name });
      await tag.save();
      return res.status(201).send({ tag });
    } else {
      return res.status(400).send({ message: "Tag already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// 해시태그 조회 라우터
reviewRouter.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

reviewRouter.get("/search", async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      return res.status(400).send({ error: "Tag query parameter is required" });
    }

    const tagDoc = await Tag.findOne({ name: tag });
    if (!tagDoc) {
      return res.status(404).send({ error: "Tag not found" });
    }

    const reviews = await Review.find({ tags: tagDoc._id })
      .populate("user", "name")
      .populate("tags");

    return res.status(200).send({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
//--------------------------------------------------------->

//리뷰 리스트
reviewRouter.get("/:rtId", async (req, res) => {
  // reviewRouter.get("/restaurant/:restId", async (req, res) => {
  try {
    const { rtId } = req.params;
    // console.log(rtId);
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const review = await Review.find({ restaurant: rtId })
      .populate("user", "name")
      .populate("tags")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    console.log(review);
    const productsTotal = await Review.countDocuments();
    const hasMore = skip + limit < productsTotal ? true : false;

    return res.status(200).send({ review, hasMore });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//리뷰 뷰페이지
reviewRouter.get("/:rpId/view", async (req, res) => {
  const { rpId } = req.params;
  console.log(rpId);
  try {
    const { rpId } = req.params;
    if (!mongoose.isValidObjectId(rpId))
      res.status(400).send({ message: "not rpId" });

    const review = await Review.findById({ _id: rpId })
      .populate({
        path: "user",
        select: "name",
      })
      .populate("tags");
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
    const reviews = await Review.find({ user: userId })
      .populate("restaurant", "name")
      .populate("tags");
    if (!reviews) {
      return res.status(404).send({ message: "Reviews not found" });
    }
    return res.status(200).send({ reviews });
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

//리뷰 이미지데이터 삭제

module.exports = reviewRouter;
