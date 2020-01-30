const request = require("request")
const cheerio = require("cheerio")
const h2p = require('html2plaintext')

const db = require("./db.js")
const CONFIG = require ("./config.js")

class StarbucksAcvtivityCrawler {

    constructor ( bot ) {
        
        this._bot = bot
    }

    async start_interval () {

        if ( this._intervalId )
            this.stop_interval ()

        if ( !this._historyPost )
            this._historyPost = await db.getAllPost("starbucks")

        this._process ()

        this._intervalId = setInterval( this._process.bind( this ), 10 * 60 * 1000 )
    }

    stop_interval () {

        if ( this._intervalId ){
            clearInterval ( this._intervalId )
            this._intervalId = undefined
        }
    }

    async _process () {

        console.log( "start scanning starbucks" )

        const actviityListPage = await this._fetchPage( CONFIG.STARBUCKS_ACTIVITY_PAGE )
        const activityList = this._parseActivityItem(actviityListPage)
        let pushActivityList = activityList.filter( a => !this._historyPost.find( aa => aa == a.id ) )
        pushActivityList = await this._fetchActivityDetail(pushActivityList)
        this._sendMessage(pushActivityList)
        this._updateHistory(pushActivityList)
    }

    async _fetchPage( url ) {

        return await new Promise((res, rej) => {

            request( url, function (error, response, body) {
                if (error || !body)
                    rej()
                else
                    res(body)
    
            })
    
        })
    }

    _parseActivityItem ( actviityListPage ) {

        const $ = cheerio.load(actviityListPage)
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

        return activityList;
    }

    async _fetchActivityDetail ( activityList ){

        let newActivityList = []

        for (let i = 0; i < activityList.length; i++) {

            const detailPage = await this._fetchPage( activityList[i].pageUrl )

            const $ = cheerio.load(detailPage)
            const event_detail = h2p($("body > div.main.allevent > div > div.event_content").text())

            newActivityList.push ( Object.assign( {}, activityList[i], {detail: event_detail}))
        }

        return newActivityList
    }

    _sendMessage ( pushActivityList ) {

        for (let i = 0; i < pushActivityList.length; i++) {
            const message = `活動名稱：${pushActivityList[i].name}\n活動時間：${pushActivityList[i].time}\n活動網址：${pushActivityList[i].pageUrl}\n活動內容：${pushActivityList[i].detail}`
    
            this._bot.broadcast_message(message)
            
            console.log( `broadcast message: ${pushActivityList[i].id}` )
        }
    }

    _updateHistory ( pushActivityList ) {
        
        pushActivityList.forEach( ( activity ) => {
            db.addPost("starbucks", activity.id)
            this._historyPost.push(activity.id)
        })
    }
}

module.exports = StarbucksAcvtivityCrawler
