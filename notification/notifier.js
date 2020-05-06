const config = require('config');
const enable = config.get('notification.enable');

const telegram = require('./plugins/telegram');

var plugins = [];
var identifiers = [];
if (enable) {
    if (telegram.isEnable()) plugins.push(telegram);
}

function SendNotify(title, message, identifier = null) {
    if (identifier) {
        if (identifiers.includes(identifier)) return;
        identifiers.push(identifier);
    }

    for (let plugin of plugins) {
        try {
            plugin.sendNotify(title, message);
        } catch (err) {
            console.warn(err.stack);
        }
    }
}

function SendWarning(title, message, identifier = null) {
    SendNotify(`⚠️ ${title}`, message, identifier);
}

function SendDanger(title, message, identifier = null) {
    SendNotify(`❌ ${title}`, message, identifier);
}

function SendInfo(title, message, identifier = null) {
    SendNotify(`🛈 ${title}`, message, identifier);
}

function ClearIdentifier(identifier) {
    identifiers = identifiers.filter(id => id.includes(identifier));
}

module.exports = {
    SendNotify,
    SendWarning,
    SendDanger,
    SendInfo,
    ClearIdentifier
}