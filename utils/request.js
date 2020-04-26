const config = require('config');
const magicCode = config.get('magicCode');

function verifyRequest(req) {
    let code = req.get('magic-code');
    if (!code || magicCode !== code) return false;
    if (!req.body) return false;
    return true;
}

module.exports = {
    verifyRequest,
};