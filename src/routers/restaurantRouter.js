const express = require("express");
const Restaurant = require("../models/Restaurant");
const restaurantRouter = express.Router();
const Like = require("../models/Like");
const User = require("../models/User");

const mateType = [
  { no: 1, name: "lover" },
  { no: 2, name: "friend" },
  { no: 3, name: "family" },
  { no: 4, name: "group" },
  { no: 5, name: "pet" },
  { no: 6, name: "self" },
];

restaurantRouter.get("/:cateId", async (req, res) => {
  try {
    const { cateId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const restaurant = await Restaurant.find({ "category.mateType": cateId })
      .limit(limit)
      .skip(skip);
    const productsTotal = await Restaurant.countDocuments();
    const hasMore = skip + limit < productsTotal ? true : false;
    return res.status(200).send({ restaurant, hasMore });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
restaurantRouter.get("/:cateId/:rtId", async (req, res) => {
  try {
    const { rtId } = req.params;
    const restaurant = await Restaurant.findOne({ _id: rtId });
    return res.status(200).send({ restaurant });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
restaurantRouter.post("/:cateId/:userId/:rtId", async (req, res) => {
  try {
    const { userId, rtId } = req.params;
    const restaurant = await Restaurant.findById(rtId);
    restaurant.views++;
    await restaurant.save();
    console.log(restaurant.views);
    res.status(200).send({ restaurant });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
restaurantRouter.post("/:rtId/like", async (req, res) => {
  try {
    const { rtId } = req.params;
    const { userId } = req.body;
    const restaurant = await Restaurant.findById(rtId);
    const user = await User.findById(userId);
    const like = await new Like({ restaurant, user }).save();
    res.status(200).send({ like });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

module.exports = restaurantRouter;
