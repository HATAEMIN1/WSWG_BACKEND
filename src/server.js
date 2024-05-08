const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { userRouter } = require("./routers/userRouter");
const restaurantRouter = require("./routers/restaurantRouter");

dotenv.config();
app.use(express.json());
app.use(cors());

const server = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoDB connected");
    mongoose.set("debug", true);
    app.use("/user", userRouter);
    app.use("/restaurant", restaurantRouter);
    app.listen(4000, async function () {
      console.log("server on port 4000");
    });
  } catch (error) {
    console.log("error connecting to the server", error);
  }
};

server();
