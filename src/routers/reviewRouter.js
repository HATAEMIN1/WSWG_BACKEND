const express = require("express");
const { default: mongoose } = require("mongoose");
const reviewRouter = express.Router();
const User = require("../models/User");
// const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
// const Tag = require("../models/Tag");
const { upload } = require("../middlewares/imageUpload");

//post먼저
reviewRouter.post("/", async (req, res) => {
  try {
    const { userId, restId } = req.body;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restId);

    const review = await new Review({
      ...req.body,
      user: userId,
      restaurant: restId,
      createdAt: new Date(),
    }).save();
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
    console.log(req.file.filename);
    // const review = await new Review({
    //   originalFileName: req.file.originalname,
    //   key: req.file.filename,
    // });
    return res.send(req.file.filename); //key값만 받음
  } catch (error) {
    console.log(error.message);
  }
});
//--------------------------------------------------------->

//해시태그-------------------------------------------------->
// reviewRouter.post("/hashtags", async (req, res) => {
//   try {
//     const { hashtags } = req.body;

//     const tag = await new Tag({ name: hashtags }).save();
//     return res.status(200).send({ tag });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error.message });
//   }
// });

// reviewRouter.get("/review-posts/:rpId/hashtags", async (req, res) => {
//   try {
//     const { rpId } = req.params;
//     const tag = await Tag.find({});
//     if (!mongoose.isValidObjectId(hashtagId))
//       res.status(400).send({ message: "not hashtagId" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error.message });
//   }
// });

//--------------------------------------------------------->

//리뷰 리스트
reviewRouter.get("/", async (req, res) => {
  // reviewRouter.get("/restaurant/:restId", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const review = await Review.find({})
      .populate("user", "name")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const productsTotal = await Review.countDocuments();
    const hasMore = skip + limit < productsTotal ? true : false;

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
