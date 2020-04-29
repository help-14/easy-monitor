var ip = require('ip');

function GetIp() {
    return ip.address();
}

module.exports = {
    GetIp
}