const linebot = require("linebot")

const CONFIG = require('./config.js')
const db = require('./db.js')

class LineBot {

    constructor ( ) {
        
        this.bot = linebot({
            channelId: CONFIG.CHANNEL_ID,
            channelSecret: CONFIG.CHANNEL_SECRET,
            channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
        });

        this.parser = this.bot.parser();
        this.db = db;

        this._event_register()
    }

    async broadcast_message ( message ) {

        const user_list = await this.db.getAllUser('line')
        
        user_list.forEach( id => {
            this.bot.push(id, message)
        })

    }

    _event_register () {

        this.bot.on( "follow", ( event ) => {

            this.db.addUser('line', event.source.userId)

            console.log( "new line user: " + event.source.userId )
        })

        this.bot.on( "unfollow", ( event ) => {
            
            this.db.removeUser('line', event.source.userId)

            console.log( "user leave: " + event.source.userId )
        })
    }

}

module.exports = LineBot