const { Router } = require("express");
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const kakaoRouter = express.Router();

kakaoRouter.get('/', async (req, res) => {
    const { url } = req.body;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const getMetaTag = (name) => $(`meta[property='${name}']`).attr('content');

        const metaData = {
            title: getMetaTag('og:title') || $('title').text(),
            description: getMetaTag('og:description'),
            image: getMetaTag('og:image'),
            url: url,
        };

        res.json(metaData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the URL' });
    }
});

// kakaoRouter.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = kakaoRouter;