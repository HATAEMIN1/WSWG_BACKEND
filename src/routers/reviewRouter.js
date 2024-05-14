const express = require("express");
const Reveiew = require("../models/Review");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const reviewRouter = express.Router();

reviewRouter.post("/", async (req, res) => {
  try {
    const { content, rating, userId, restId } = req.body;
    console.log(userId);
    console.log(restId);
    console.log(req.body);
    let user = await User.findById(userId);
    let rest = await Restaurant.findById(restId);

    const review = await new Reveiew({ ...req.body, user, rest }).save();

    return res.status(200).send({ review });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// reviewRouter.get("/",async (req,res)=>{
//   try {

//   }
// })

module.exports = reviewRouter;
