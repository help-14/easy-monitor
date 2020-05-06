const db = require('./db');
const prettyMilliseconds = require('pretty-ms');

var cacheData = null;

async function GetCacheData() {
    if (cacheData) return cacheData;
    await SetCacheData();
    return cacheData || [];
}

async function GetCacheFormatData() {
    let data = [];
    let servers = await GetCacheData();
    if (servers) {
        servers.forEach(server => {
            let clone = Object.assign({}, server);
            clone.cpu = formatPercentage(clone.cpu);
            clone.memory = formatPercentage(clone.memory);
            clone.disk = formatPercentage(clone.disk);
            clone.uptime = formatMs(clone.uptime, { compact: true });
            data.push(clone);
        });
    }
    return data;
}

function formatMs(miliseconds) {
    if (miliseconds)
        return prettyMilliseconds(miliseconds);
    return milisecondsl;
}

function formatPercentage(amount) {
    if (amount)
        return amount.toFixed(2) + ' %';
    return amount;
}

async function SetCacheData() {
    let servers = await db.query('SELECT servers.name, servers.identifier FROM servers ORDER BY servers.name ASC');
    if (!servers) return;

    let data = [];
    for (let row of servers.rows) {
        let server = {
            name: row.name,
            id: row.identifier
        };
        let infos = await db.query(`SELECT * FROM logs WHERE server='${row.identifier}' ORDER BY time DESC LIMIT 1`);
        let info = (infos && infos.rows.length > 0) ? infos.rows[0] : null;

        server.time = info.time;
        server.cpu = info ? info.cpu.usage : 0;
        server.memory = info ? (info.memory.usedMemMb / info.memory.totalMemMb) * 100 : 0;
        server.networkInput = (info && info.network && info.network.total) ? info.network.total.inputMb : 0;
        server.networkOutput = (info && info.network && info.network.total) ? info.network.total.outputMb : 0;
        server.disk = (info && info.disk && info.disk.usedPercentage) ? parseFloat(info.disk.usedPercentage) : 0;
        server.uptime = (info && info.os && info.os.uptime) ? info.os.uptime : 0;
        server.process = (info && info.process && info.process.total) ? info.process.total : 0;
        server.openFiles = (info && info.file && info.file.open) ? info.file.open : 0;

        infos = await db.query(`SELECT * FROM pings WHERE server='${row.identifier}' ORDER BY time DESC LIMIT 1`);
        info = (infos && infos.rows.length > 0) ? infos.rows[0] : null;

        server.ip = (info && info.ip) ? info.ip : '0.0.0.0';

        data.push(server);
    }
    cacheData = data;
}

function UpdateCacheData(server, property, value) {
    if (!cacheData) return;
    for (let i = 0; i < cacheData.length; i++) {
        if (cacheData[i].id === server) {
            cacheData[i][property] = value;
            return;
        }
    }
}

function GetServerCache(server) {
    if (!cacheData) return;
    for (let i = 0; i < cacheData.length; i++) {
        if (cacheData[i].id === server) {
            return cacheData[i];
        }
    }
    return null;
}

function ClearCache() {
    cacheData = null;
}

function FormatTime(milisecond) {
    let formater = new Intl.RelativeTimeFormat('vi', { style: 'long' });
    let seconds = -timestamp / 1000;

    var interval = seconds / 31536000;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'years');

    interval = seconds / 2592000;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'months');

    interval = seconds / 604800;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'weeks');

    interval = seconds / 86400;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'days');

    interval = seconds / 3600;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'hours');

    interval = seconds / 60;
    if (Math.abs(interval) >= 1) return formater.format(Math.floor(interval), 'minutes');

    return formater.format(seconds, 'seconds');
}

module.exports = {
    GetCacheData,
    GetCacheFormatData,
    SetCacheData,
    UpdateCacheData,
    FormatTime,
    GetServerCache,
    ClearCache
}