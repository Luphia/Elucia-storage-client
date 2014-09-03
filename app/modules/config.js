var os = (process.env.OS == "Windows_NT")? "win": "unknown",
    configModule = "./config."+ os;

module.exports = require(configModule);