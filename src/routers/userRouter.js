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
    axios
      .post("https://kauth.kakao.com/oauth/token", null, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "authorization_code",
          client_id: process.env.REST_API_KEY,
          redirect_uri: process.env.REDIRECT_URI, // 카카오 로그인 한 후 인가코드 authCode 받는 용도 -> 인가코드로 access token을 받고 이 access token으로 카카오 유저 정보를 받는다
          code: authCode, // 카카오 서버에서 redirect uri로 인가코드를 보낼때, url 속에 query문으로 담아서 보내줌. 이를 받아서 다시 쓰는 것
        },
      })
      .then((response) => {
        console.log("response.data", response.data);
        // use jwt decode
        // console.log("access token:", response.data.access_token);
        // 카카오에서 access token과 refresh token 가져오기
        // let { accessToken, refreshToken } = response.data;
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        // accessToken 저장하기
        // localStorage.setItem("accessToken", accessToken);
        // refreshToken 저장하기
        // localStorage.setItem("refreshToken", refreshToken);

        // 카카오에서 가져온 access token으로 유저 정보 가져오기
        // axios
        //   .get("https://kapi.kakao.com/v2/user/me", {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //       "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        //     },
        //   })
        //   .then((response) => {
        //     console.log("kakao user data retrieved:", response.data);
        //     res.status(200).send(response.data);
        //     // create user if user does not exist in db
        //     // or make user logged in here?'
        //     // 가져온 유저 정보를 db와 session에 저장해야한다
        //     // 가져온 유저 정보(이름/아이디)로 이메일과 비번을 억지로 만들어서 (백에서만 유저는 프론트에서 이걸 못봄) 회원가입과 로그인까지 해준다.
        //     // 유저 프로필 사진이랑 닉네임/이름 밖에 카카오에서 못가져오고 이메일을 못가져와서 만들어줘야한다 백에서만
        //   });
        // res.status(200).send({ authCode });
      });
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
