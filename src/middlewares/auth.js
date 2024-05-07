const jwt = require("jsonwebtoken");
const User = require("../models/User");

let auth = async (req, res, next) => {
  //토큰을 가져오기

  const authHeader = req.headers["authorization"];
  //Bearer jkfl;dajfdklsajf;lsa.jfkl;sdajdla;f.jcklajsfdlk fdsafd
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);

  console.log("token" + token);

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({_id: decode.userId});

    if (!user) {
      return res.status(400).send("없는 유저입니다.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;