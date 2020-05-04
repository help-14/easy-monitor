const config = require('config');
const magicCode = config.get('magicCode');

function verifyRequest(req) {
    let code = req.get('magic-code');
    if (!code || magicCode !== code) return false;
    if (!req.body) return false;
    return true;
}

function verifyParam(param) {
    return /^[a-zA-Z0-9\s\-]+$/.test(keyword)
}

module.exports = {
    verifyRequest,
    verifyParam
};