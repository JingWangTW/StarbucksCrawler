const request = require("request")
const cheerio = require("cheerio")
const h2p = require('html2plaintext')
const linebot = require("linebot")

try {
    const CONFIG = require("./config.js")
} catch (ex) {
}

const bot = linebot({
    CHANNEL_ID: process.env.CHANNEL_ID || CONFIG.CHANNEL_ID,
    CHANNEL_SECRET: process.env.CHANNEL_SECRET || CONFIG.CHANNEL_SECRET,
    CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN || CONFIG.CHANNEL_ACCESS_TOKEN,
});

async function starbuckCrawler() {
    const webPage = await new Promise((res, rej) => {

        request(process.env.STARBUCKS_ACTIVITY_PAGE || CONFIG.STARBUCKS_ACTIVITY_PAGE, function (error, response, body) {
            if (error || !body)
                rej()
            else
                res(body)

        })

    })

    const $ = cheerio.load(webPage)
    const activityList = $("#tabs-1 > ul li").map((index, element) => {

        const pageUrl = new URL($(element).children("a").attr("href"), CONFIG.STARBUCKS_ACTIVITY_PAGE).toString()
        const time = $(element).find("p").text()
        const name = $(element).find("h3").text()
        const id = parseInt(pageUrl.substring(pageUrl.indexOf("?n=") + 3), 10)

        return {
            id: id,
            name: name,
            time: time,
            pageUrl: pageUrl,
        }
    }).toArray()

    for (let i = 0; i < activityList.length; i++) {

        const detail_page = await new Promise((res, rej) => {

            request(activityList[i].pageUrl, function (error, response, body) {
                if (error || !body)
                    rej()
                else
                    res(body)

            })
        })

        const $ = cheerio.load(detail_page)
        const event_detail = h2p($("body > div.main.allevent > div > div.event_content").text())
        activityList[i].detail = event_detail
    }

    /*
    for (let i = 0; i < activityList.length; i++) {
        const message = `活動名稱：${activityList[i].name}\n活動時間：${activityList[i].time}\n活動網址：${activityList[i].pageUrl}\n活動內容：${activityList[i].detail}`
        bot.push(process.env.USER_ID || CONFIG.USER_ID, message)
    }
    */
}

bot.on('message', function (event) {

    console.log(event)
});

app.listen(process.env.PORT || 8080, function () {
    setInterval(starbuckCrawler, 60 * 1000);
});