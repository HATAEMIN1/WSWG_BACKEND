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
    const restaurant = await Restaurant.find({ "category.mateType": cateId });
    return res.status(200).send({ restaurant });
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

module.exports = restaurantRouter;
