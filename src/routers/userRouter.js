const express = require("express");
const { mongoose } = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Like = require("../models/Like");
const userRouter = express.Router();
const { upload } = require("../middlewares/imageUpload.js");
const { hash, compare } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth.js");
require("dotenv").config();
const axios = require("axios");
const { jwtDecode } = require("jwt-decode");
// const fs = require("fs");

userRouter.post("/register", async (req, res) => {
  // make it so that if the name or email already exists, return error with 400 status code
  try {
    console.log("req.body:", req.body);
    const { name, email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      res.status(400).send({ error: "비번이 비번확인과 일치하지 않습니다!" });
    }
    const existingUserByName = await User.findOne({ name });
    const existingUserByEmail = await User.findOne({ email });
    console.log("register existing user by name:", existingUserByName);
    console.log("register existing user by email:", existingUserByEmail);
    if (existingUserByName || existingUserByEmail) {
      res
        .status(400)
        .send({ error: "이미 존재하는 닉네임 또는 이메일 주소입니다!" });
    }
    const hashedPassword = await hash(password, 10);

    const user = await new User({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    }).save();
    console.log("user", user);
    return res.status(200).send({ user });
  } catch (error) {}
});

userRouter.post("/kakao-login", async (req, res) => {
  // id_token 프론트에서 받기
  try {
    console.log("req.body", req.body);
    const decoded = jwtDecode(req.body.id_token);
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
        password: existingUser.password,
        image: { ...existingUser.image, originalname: profilePic },
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "7d", // 일주일 뒤 토큰 만료
      });

      return res
        .status(200)
        .send({ existingUser, accessToken, message: "로그인 성공" });
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
      res.status(200).send({ newUser, message: "회원가입 성공" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error });
  }
});

userRouter.post("/naver-login", async (req, res) => {
  try {
    const response = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "authorization_code",
          client_id: process.env.REACT_APP_NAVER_CLIENT_ID,
          client_secret: process.env.REACT_APP_NAVER_CLIENT_SECRET,
          redirect_uri: process.env.REACT_APP_NAVER_REDIRECT_URI,
          code: req.body.code,
        },
      }
    );
    console.log("response.data", response.data);
    const userDataResponse = await axios.post(
      "https://openapi.naver.com/v1/nid/me",
      null,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );
    console.log(
      "userDataResponse.data.response",
      userDataResponse.data.response
    );
    const userData = userDataResponse.data.response;

    const username = userData.nickname;
    const profilePic = userData.profile_image;
    const email = userData.email;
    const password = await hash(email, 10);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const payload = {
        userId: existingUser._id.toHexString(),
        email: existingUser.email,
        role: existingUser.role,
        password: existingUser.password,
        image: { ...existingUser.image, originalname: profilePic },
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "7d",
      });

      return res
        .status(200)
        .send({ existingUser, accessToken, message: "로그인 성공" });
    } else {
      const newUser = await new User({
        name: username,
        email,
        password,
        image: {
          filename: `profilePic-${username}.jpg`,
          originalname: profilePic,
        },
        createdAt: new Date(),
      }).save();
      res.status(200).send({ newUser, message: "회원가입 성공" });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ error: "존재하지 않는 이메일 입니다" });
    }

    const isMatch = await compare(req.body.password, user.password);
    console.log(
      "req.body.password:",
      req.body.password,
      "user.password:",
      user.password
    );
    const hashedPwd = await hash(req.body.password, 10);
    console.log("hashed req.body.password:", hashedPwd);

    if (!isMatch) {
      return res
        .status(400)
        .send({ error: "비밀번호가 다릅니다. 비밀번호 확인해주세요" });
    }

    const payload = {
      userId: user._id.toHexString(),
      email: user.email,
      role: user.role,
      image: user.image,
      password: user.password,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).send({ user, accessToken, message: "로그인성공" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "login fail", error: error.message });
  }
});

userRouter.post("/passwordCheck", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body; // newpassword is not encrypted, oldpassword is already hashed
    const isMatch = await compare(newPassword, oldPassword);
    return res.status(200).send({ isMatch });
  } catch (e) {
    console.log("error:", e);
    return res.status(500).send({ error: e.message });
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
      password: req.user.password,
    };
    return res.status(200).send({ user });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
});

userRouter.post("/logout", auth, async (_, res) => {
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
      res.status(400).send({ error: "not a valid userId" });

    const user = await User.findById(userId);

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// 내가 찜한 가게 - like 누르면 백에 like 가 아직 안들어가서 그 기능 만들어 지면 만들기
userRouter.get("/:userId/likedResturants", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      res.status(400).send({ error: "not a valid userId" });
    const likes = await Like.find({ user: userId });
    return res.status(200).send({ likes });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// 내가 작성한 리뷰
// userRouter.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const reviews = await Review.find({ user: userId })
//       .populate("restaurant", "name") // 리뷰와 관련된 식당 정보 가져오기
//       .sort({ createdAt: -1 }); // 작성일자를 내림차순으로 정렬

//     if (!reviews.length) {
//       return res.status(404).send({ message: "작성한 리뷰가 없습니다" });
//     }
//     return res.status(200).send({ reviews });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ error: error.message });
//   }
// });

// 내가 등록한 우리 만날까

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

userRouter.put(
  "/:userId/update",
  upload.single("image"),
  async function (req, res) {
    try {
      const { userId } = req.params;

      // scenarios: 1. image change AND password change
      // 2. image chnage only but no password change
      // 3. password change only but no image change
      if (req.file && req.body.password) {
        const { filename, originalname } = req.file;
        const image = { filename, originalname };
        const hashedPassword = await hash(req.body.password, 10);
        const user = await User.findByIdAndUpdate(
          userId,
          {
            password: hashedPassword,
            image,
          },
          { new: true }
        );
        console.log("user with updated password and image:", user);
        return res.send({ user });
      } else if (!req.file && req.body.password) {
        const hashedPassword = await hash(req.body.password, 10);
        const user = await User.findByIdAndUpdate(
          userId,
          {
            password: hashedPassword,
          },
          { new: true }
        );
        console.log("user with updated password:", user);
        return res.send({ user });
      } else if (req.file && !req.body.password) {
        const { filename, originalname } = req.file;
        const image = { filename, originalname };
        const user = await User.findByIdAndUpdate(
          userId,
          {
            image,
          },
          { new: true }
        );
        console.log("user with updated image:", user);
        return res.send({ user });
      }
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  }
);

module.exports = { userRouter };
