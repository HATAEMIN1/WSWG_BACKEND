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
    const mateTypeName = mateType.find((type) => type.cateId === cateId)?.name;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const { search, filters } = req.query;

    const findArgs = {
      "category.mateType": mateTypeName,
    };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      if (parsedFilters.metropolitan) {
        findArgs["location.metropolitan"] = parsedFilters.metropolitan;
      }
      if (parsedFilters.city) {
        findArgs["location.city"] = parsedFilters.city;
      }
    }

    if (search) {
      findArgs["name"] = { $regex: search, $options: "i" };
    }

    console.log("Search Parameters:", findArgs); // 검색 조건 로그 추가

    const restaurants = await Restaurant.find(findArgs).limit(limit).skip(skip);
    console.log("Found Restaurants:", restaurants); // 검색된 레스토랑 로그 추가

    const restaurantsTotal = await Restaurant.countDocuments(findArgs);
    const hasMore = skip + limit < restaurantsTotal;

    return res.status(200).send({ restaurant: restaurants, hasMore });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

restaurantRouter.get("/:cateId/:rtId", async (req, res) => {
  try {
    const { rtId, cateId } = req.params;
    const mateTypeName = mateType.find((type) => type.cateId === cateId)?.name;
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
    const { lat, lon, cateId } = req.body;
    const mateTypeName = mateType.find((type) => type.cateId === cateId)?.name;
    const findArgs = {};
    if (cateId) {
      findArgs["category.mateType"] = mateTypeName;
    }
    // 현재 위치에서 2km 이내의 레스토랑 데이터 조회
    const restaurant = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)], // 경도, 위도 순서
          },
          distanceField: "distance",
          maxDistance: 2000, // 최대 거리 (미터 단위, 여기서는 2km)
          spherical: true,
        },
      },
      { $match: findArgs },
    ]);
    return res.status(200).json({ restaurant }); // 조회된 레스토랑 데이터를 JSON 응답으로 보냄
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ error: "데이터 조회 중 오류 발생" });
  }
});

restaurantRouter.get("/", async (req, res) => {
  try {
    console.log("Received request with query params:", req.query);
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);
    const search = req.query.search;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = req.query.skip ? Number(req.query.skip) : 0;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).send({ error: "Invalid latitude or longitude" });
    }

    const match = {};

    if (search) {
      if (search.startsWith("#")) {
        // 해시태그 검색
        match["reviews.tags.name"] = search.slice(1);
      } else {
        // 일반 검색
        match["name"] = { $regex: search, $options: "i" };
      }
    }

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 2000, // 2km
          spherical: true,
        },
      },
      { $match: match },
      { $skip: skip },
      { $limit: limit },
    ]);

    const restaurantsTotal = await Restaurant.countDocuments(match);
    const hasMore = skip + limit < restaurantsTotal;

    res.status(200).send({ restaurant: restaurants, hasMore });
  } catch (e) {
    console.error("Error fetching restaurants:", e);
    res.status(500).send({ error: e.message });
  }
});



module.exports = restaurantRouter;
