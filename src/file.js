const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../logs');

function checkRequireFolder() {
    if (!fs.existsSync(logPath))
        fs.mkdirSync(logPath);
}

function WriteLog(log) {
    checkRequireFolder();
    const filePath = path.join(logPath, log.time);
    if (fs.existsSync(filePath)) {
        console.error(`Log file is already exists for timestamp ${log.time}`);
        return false;
    } else {
        fs.writeFileSync(filePath, JSON.stringify(log));
        return true;
    }
}

function ReadLog(time) {
    checkRequireFolder();
    const filePath = path.join(logPath, time);
    if (fs.existsSync(filePath)) {
        try {
            let data = fs.readFileSync(filePath);
            return JSON.parse(data);
        } catch (err) {
            console.warn(err);
            return null;
        }
    } else {
        console.error(`Log file doesn't exists for timestamp ${log.time}`);
        return null;
    }
}

function DeleteLog(time) {
    checkRequireFolder();
    const filePath = path.join(logPath, time);
    if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
}

function ListingLog() {
    checkRequireFolder();
    return fs.readdirSync(logPath);
}

module.exports = {
    WriteLog: WriteLog,
    ReadLog: ReadLog,
    DeleteLog: DeleteLog,
    ListingLog: ListingLog
}