const express = require("express");
const { mongoose } = require("mongoose");
const User = require("../models/User");
const userRouter = express.Router();
const { upload } = require("../middleware/imageUpload");
const {hash, compare} = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");

userRouter.post("/register", async (req, res) => {
    try {
      const password = await hash(req.body.password, 10);
      const user = await new User({
        name: req.body.name,
        email: req.body.email,
        password,
        createdAt: new Date(),
      }).save();
      return res.status(200).send({user});
    } catch (error) {}
  });
  
  userRouter.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({email: req.body.email});
      if (!user) {
        return res.status(400).send({message: "이메일을 확인해주세요"});
      }
  
      const isMatch = await compare(req.body.password, user.password);
  
      if (!isMatch) {
        return res.status(400).send({message: "비밀번호 확인해주세요"});
      }
  
      const payload = {
        userId: user._id.toHexString(),
        email: user.email,
        role: user.role,
      };
  
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
  
      return res.status(200).send({user, accessToken, message: "로그인성공"});
    } catch (error) {
      return res.status(500).send({message: "login fail"});
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
      return res.status(200).send({user});
    } catch (e) {
      return res.status(500).send({error: e.message});
    }
  });
  
  userRouter.post("/logout", auth, async (req, res) => {
    try {
      return res.status(200).send({message: "로그아웃되셨습니다."});
    } catch (e) {
      return res.status(500).send({error: e.message});
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
