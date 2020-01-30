const express = require('express');

const CONFIG = require("./config.js")
const LineBot = require ("./line-bot.js")
const StarbucksAcvtivityCrawler = require("./starbucks-activity-crawler.js")

const app = express();
let linebot = new LineBot()

let starbucksAcvtivityCrawler = new StarbucksAcvtivityCrawler(linebot)

app.post('/', linebot.parser);

starbucksAcvtivityCrawler.start_interval()

app.listen(process.env.PORT || 5000)