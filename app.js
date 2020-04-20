const config = require('config');
const { GetDeviceInfo, GetLog } = require('./src/logger');
const { WriteLog, ReadLog, DeleteLog, ListingLog } = require('./src/file');

const dailyDeviceInfoLog = config.get('dailyDeviceInfoLog');
const retrySentData = config.get('retrySentData');

async function Start() {
    if (dailyDeviceInfoLog) {
        console.log(await GetDeviceInfo());
    }

    let log = await GetLog();
    console.log(JSON.stringify(log));

    if (retrySentData) {
        var logFiles = ListingLog();
        for (let file of logFiles) {
            let oldLog = ReadLog(file);
            if (oldLog) {

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