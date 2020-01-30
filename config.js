try {
    var _conf = require("./configuration.json")
} catch (ex) {
}

const CONFIG = _conf

const config = new Proxy ({}, {
    get: function(target, name) {
        if ( name in process.env )
            return process.env[name]
        else
            return CONFIG[name]
    }
})

module.exports = config