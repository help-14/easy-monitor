const bent = require('bent');

const config = require('config');
const identifier = config.get('identifier');
const servers = config.get('remoteServers');

async function SentInfoToAll(data) {
    for (let server of servers) {
        await SentInfoToServer(data, server);
    }
}

async function SentInfoToServer(data, server) {
    let post = bent(server.url, 'POST', 'json', 200);
    let header = {
        "magic-code": server.magicCode,
        'content-type': 'application/json'
    };
    try {
        let response = await post(`api/info/${identifier}`, data, header);
        return processResponse(response);
    }
    catch (err) {
        console.warn('Sent info to server failed: ', server.url);
        console.warn(err);
        return false;
    }
}

async function SentLogToAll(data) {
    for (let server of servers) {
        await SentLogToServer(data, server);
    }
}

async function SentLogToServer(data, server) {
    let post = bent(server.url, 'POST', 'json', 200);
    let header = {
        "magic-code": server.magicCode,
        'content-type': 'application/json'
    };
    try {
        let response = await post(`api/log/${identifier}`, data, header);
        return processResponse(response);
    }
    catch (err) {
        console.warn('Sent info to server failed: ', server.url);
        console.warn(err);
        return false;
    }
}

function processResponse(response) {
    if (response.result) {
        return true;
    } else {
        console.warn('Sent info to server failed: ', server.url);
        console.warn(response);
        return false;
    }
}

module.exports = {
    SentInfoToAll,
    SentLogToAll
}