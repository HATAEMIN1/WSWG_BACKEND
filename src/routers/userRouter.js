const express = require("express");
const { mongoose } = require("mongoose");
const User = require("../models/User");
const userRouter = express.Router();
const { upload } = require("../middlewares/imageUpload.js");
const { hash, compare } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth.js");
require("dotenv").config();
const axios = require("axios");
const { jwtDecode } = require("jwt-decode");

userRouter.post("/register", async (req, res) => {
  try {
    const password = await hash(req.body.password, 10);
    const user = await new User({
      name: req.body.name,
      email: req.body.email,
      password,
      createdAt: new Date(),
    }).save();
    return res.status(200).send({ user });
  } catch (error) {}
});

userRouter.get("/kakao-login", async (req, res) => {
  // 인가코드
  try {
    let authCode = req.query.code;
    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "authorization_code",
          client_id: process.env.REST_API_KEY,
          redirect_uri: process.env.REDIRECT_URI, // 카카오 로그인 한 후 인가코드 authCode 받는 용도 -> 인가코드로 access token을 받고 이 access token으로 카카오 유저 정보를 받는다
          code: authCode, // 카카오 서버에서 redirect uri로 인가코드를 보낼때, url 속에 query문으로 담아서 보내줌. 이를 받아서 다시 쓰는 것
        },
      }
    );

    console.log("response.data", response.data);
    const decoded = jwtDecode(response.data.id_token);
    console.log("decoded", decoded);
    const username = decoded.nickname;
    const profilePic = decoded.picture;
    console.log("username", username);
    console.log("profile picture filename", profilePic);

    const password = await hash(username, 10);
    const email = password + "@mail.com";
    const existingUser = await User.findOne({ name: username });
    console.log("existingUser", existingUser);
    if (existingUser) {
      // login and return
      const payload = {
        userId: existingUser._id.toHexString(),
        email: existingUser.email,
        role: existingUser.role,
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      return res
        .status(200)
        .send({ existingUser, accessToken, message: "로그인성공" });
    } else {
      // i,e, if user with the mail does not already exist, then sign up user
      const newUser = await new User({
        name: username,
        email,
        password,
        image: {
          // single image so {} without []
          filename: `profilePic-${username}.jpg`,
          originalname: profilePic,
        },
        createdAt: new Date(),
      }).save();
      res.status(200).send({ newUser });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ message: "이메일을 확인해주세요" });
    }

    const isMatch = await compare(req.body.password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .send({ message: "비밀번호가 다릅니다. 비밀번호 확인해주세요" });
    }

    const payload = {
      userId: user._id.toHexString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).send({ user, accessToken, message: "로그인성공" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "login fail", error: error.message });
  }
});

userRouter.get("/auth", auth, async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      image: req.user.image,
    };
    return res.status(200).send({ user });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
});

userRouter.post("/logout", auth, async (req, res) => {
  try {
    return res.status(200).send({ message: "로그아웃되셨습니다." });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
});

userRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { filename, originalname } = req.file;
    const image = { filename, originalname };

    if (typeof name !== "string")
      res.status(400).send({ error: "name is required" });
    if (typeof email !== "string")
      res.status(400).send({ error: "email is required" });
    if (typeof password !== "string")
      res.status(400).send({ error: "password is required" });

    let user = await new User({ ...req.body, image }).save();

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

userRouter.get("/", async (_, res) => {
  try {
    const user = await User.find({});
    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      res.status(400).send({ message: "not a valid userId" });

    const user = await User.findById(userId);

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

userRouter.delete("/:userId", async function (req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    return res.send({ user });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

userRouter.put("/:userId", upload.single("image"), async function (req, res) {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;
    const { filename, originalname } = req.file;
    const image = { filename, originalname };

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        password,
        image,
      },
      { new: true }
    );
    return res.send({ user });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = { userRouter };
