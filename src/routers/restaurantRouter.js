const express = require("express");
const Restaurant = require("../models/Restaurant");
const restaurantRouter = express.Router();

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
    const { search } = req.query;
    const findArgs = { "category.mateType": cateId };
    if (search) {
      findArgs["$text"] = { $search: search };
    }

    const restaurant = await Restaurant.find(findArgs).limit(limit).skip(skip);
    const restaurantsTotal = await Restaurant.countDocuments(findArgs);
    const hasMore = skip + limit < restaurantsTotal ? true : false;
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

//------------------------------------------------------------
// Router.get("/restaurantId", async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(
//       req.params.restaurantId
//     ).populate("reviews");
//     res.json({ restaurant });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = restaurantRouter;
