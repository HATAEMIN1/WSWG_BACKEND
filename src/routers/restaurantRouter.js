const express = require("express");
const Restaurant = require("../models/Restaurant");
const restaurantRouter = express.Router();

const mateType = [
  { no: 1, cateId: "lover", name: "연인" },
  { no: 2, cateId: "friend", name: "친구" },
  { no: 3, cateId: "family", name: "가족" },
  { no: 4, cateId: "group", name: "단체모임" },
  { no: 5, cateId: "pet", name: "반려동물" },
  { no: 6, cateId: "self", name: "혼밥" },
];

restaurantRouter.get("/:cateId", async (req, res) => {
  try {
    const { cateId } = req.params;
    const mateTypeName = mateType.find((type) => type.cateId === cateId)?.name; // 해당 cateId의 mateType 이름 찾기
    const limit = req.query.limit ? Number(req.query.limit) : 0;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const { search, filters, foodtype } = req.query;
    console.log(foodtype);
    const findArgs = {
      "category.mateType": mateTypeName,
      "category.foodtype": foodtype,
    };
    if (filters) {
      if (filters.metropolitan) {
        findArgs["address.metropolitan"] = filters.metropolitan;
      }
      if (filters.city) {
        findArgs["address.city"] = filters.city;
      }
    }
    if (search) {
      findArgs["name"] = { $regex: search, $options: "i" };
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
    const { rtId, cateId } = req.params;
    const mateTypeName = mateType.find((type) => type.cateId === cateId)?.name; // 해당 cateId의 mateType 이름 찾기
    const restaurant = await Restaurant.findOne({
      _id: rtId,
      "category.mateType": mateTypeName,
    });
    return res.status(200).send({ restaurant });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});
restaurantRouter.post("/:cateId/:rtId/view", async (req, res) => {
  try {
    const { rtId } = req.params;
    const restaurant = await Restaurant.findById(rtId);
    restaurant.views++;
    await restaurant.save();
    res.status(200).send({ restaurant });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

restaurantRouter.post("/location", async (req, res) => {
  try {
    const { lat, lon } = req.body;
    // 현재 위치에서 2km 이내의 레스토랑 데이터 조회
    const restaurant = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)], // 경도, 위도 순서
          },
          distanceField: "distance",
          maxDistance: 2000, // 최대 거리 (미터 단위, 여기서는 2km) 2000
          spherical: true,
        },
      },
    ]);
    return res.status(200).json({ restaurant }); // 조회된 레스토랑 데이터를 JSON 응답으로 보냄
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ error: "데이터 조회 중 오류 발생" });
  }
});
module.exports = restaurantRouter;
