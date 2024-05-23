const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { userRouter } = require("./routers/userRouter");
const meetUpPostRouter = require("./routers/meetUpPostRouter");
const restaurantRouter = require("./routers/restaurantRouter");
const meetUpPostCommentRouter = require("./routers/meetUpPostCommentRouter");
const reviewRouter = require("./routers/reviewRouter");
const kakaoRouter = require("./routers/kakaoRouter");
const likeRouter = require("./routers/likeRouter");

dotenv.config(); //.env파필에있는것들을쓰되다른사람들한테보이지않게하기위해
app.use(express.json());
app.use(cors()); //cors에러방지하기위해씀

app.use("/uploads", express.static("uploads")); //static:image파일을들어갈수잇는권한을갖고잇는애

const server = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoDB connected");

    mongoose.set("debug", true);
    app.use("/users", userRouter);
    app.use("/restaurants", restaurantRouter);
    app.use("/likes", likeRouter);
    app.use("/meet-posts", meetUpPostRouter);
    app.use("/review-posts", reviewRouter);

    app.use("/meet-posts/:mpId/comments", meetUpPostCommentRouter);
    app.use("/meta", kakaoRouter);
    app.listen(4000, async function () {
      console.log("server on port 4000");
    });
  } catch (error) {
    console.log("error connecting to the server", error);
  }
};

server();
