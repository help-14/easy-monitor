const config = require('config');
const { GetDeviceInfo, GetLog } = require('./src/logger');
const { WriteLog, ReadLog, DeleteLog, ListingLog } = require('./src/file');
const { SentInfoToAll, SentLogToAll } = require('./src/server')
const bent = require('bent');

const dailyDeviceInfoLog = config.get('dailyDeviceInfoLog');
const retrySentData = config.get('retrySentData');

async function Start() {
    // if (dailyDeviceInfoLog) {
    //     let info = await GetDeviceInfo();
    //     console.log(JSON.stringify(info));
    //     await SentInfoToAll(info);
    // }

    let log = await GetLog();
    await SentLogToAll(log);

    if (retrySentData) {
        var logFiles = ListingLog();
        for (let file of logFiles) {
            let oldLog = ReadLog(file);
            if (oldLog) {
                await SentLogToAll(oldLog);
                DeleteLog(file);
            }
            else {
                DeleteLog(file);
            }
        }
    }
}

Start();
    // .catch(err => {
    //     console.error(err);
    // })
    // .then(() => {
    //     console.info(`Sent logs to remote servers successed at ${new Date().toString()}`);
    // });