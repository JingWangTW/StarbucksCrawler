const firebase = require("firebase/app");
const admin = require('firebase-admin');

const CONFIG = require('./config.js')

class Database {

    constructor () {
        
        const serviceAccount = JSON.parse(CONFIG.GOOGLE_FIRE_BASE_ADMIN)

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://tony-starbucks-bot.firebaseio.com"
        });

        this.db = admin.firestore();

    }

    async addUser(botProvider, id) {

        await this.db.collection('bot').doc('user').update({
            [botProvider]: admin.firestore.FieldValue.arrayUnion(id)
        })
    }

    async removeUser(botProvider, id){

        await this.db.collection('bot').doc('user').update({
            [botProvider]: admin.firestore.FieldValue.arrayRemove(id)
        })
    }

    async getAllUser(botProvider){

        return await this.db.collection('bot').doc('user').get()
            .then((doc) => {
                return doc.data()[botProvider] ? doc.data()[botProvider] : []
            })
            .catch((err) => {
                console.log('Error getting documents', err);
            });

    }

    async addPost(service, id) {

        await this.db.collection('bot').doc('service').update({
            [service]: admin.firestore.FieldValue.arrayUnion(id)
        })
    }

    async getAllPost(service){

        return new Promise ( ( res, rej ) => {
            this.db.collection('bot').doc('service').get()
                .then((doc) => {
                    res ( doc.data()[service] ? doc.data()[service] : [] )
                })
                .catch((err) => {
                    console.log('Error getting documents', err);
                    rej();
                });
        } )
    }  

}

// singleton part
let db
if ( Database.prototype.db ) {
    db = Database.prototype.db
}
else {
    db = new Database()
    Database.prototype.db = db
}
    
module.exports = db