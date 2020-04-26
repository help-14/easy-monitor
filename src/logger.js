const osu = require('node-os-utils');
const cpu = osu.cpu;
const drive = osu.drive;
const proc = osu.proc;
const memory = osu.mem;
const netstat = osu.netstat;
const os = osu.os;
const osCmd = osu.osCmd;

const ps = require('current-processes');
const _ = require('lodash');

const config = require('config');
const numberTopProcess = config.get('numberOSTopProcess');
const enabledLog = config.get('enabledLog');

const notSupported = "not supported";

async function GetDeviceInfo() {
    let result = {
        time: Date.now(),
        cpu: {
            count: cpu.count(),
            name: cpu.model().trim()
        },
        os: {
            name: await os.oos(),
            platform: os.platform(),
            type: os.type(),
            arch: os.arch()
        },
    };
    try { result.ip = os.ip() } catch { }
    return result;
}

async function GetLog() {
    var result = {
        time: Date.now()
    };

    if (enabledLog.cpu) {
        result.cpu = {};
        result.cpu.usage = await cpu.usage();
        result.cpu.loadavg = cpu.loadavg();
        // number of task waiting to exec in 1, 5, 15 min
    }

    if (enabledLog.memory) {
        result.memory = await memory.used();
    }

    if (enabledLog.network) {
        result.network = await netstat.inOut();
        if (result.network === notSupported)
            result.network = {};
    }

    if (enabledLog.disk) {
        try {
            result.disk = await drive.used();
        } catch (err) {
            console.warn(err);
        }
    }

    if (enabledLog.os) {
        result.os = {};
        result.os.uptime = os.uptime();

        if (enabledLog.process) {
            if (enabledLog.cpu)
                result.os.topCmdCpu = await topCmdCpu();
            if (enabledLog.memory)
                result.os.topCmdMem = await topCmdMem();
        }
    }

    if (enabledLog.process) {
        result.process = {};

        result.process.total = await proc.totalProcesses();
        if (result.process.total === notSupported)
            result.process.total = 0;

        result.process.zombie = await proc.zombieProcesses();
        if (result.process.zombie === notSupported)
            result.process.zombie = 0;

        try {
            result.process.list = await getAllProcess();
        } catch (err) {
            console.warn(err);
        }
    }

    if (enabledLog.file) {
        result.file = {};
        result.file.open = await osu.openfiles.openFd();
        if (result.file.open === notSupported)
            result.file.open = 0;
    }

    return result;
}

async function topCmdCpu() {
    var result = [];
    var info = await osCmd.topCpu();
    let lines = info.split('\n');

    for (let line of lines) {
        let parts = /^(\d\.\d)(\s+)(.*?)(\s\s+)(.*?)$/gm.exec(line.trim());
        if (!parts || parts.length < 6) continue;
        result.push({
            user: parts[3],
            cmd: parts[5],
            cpu: parseFloat(parts[1])
        });
    }
    result = _.sortBy(result, 'cpu').reverse();
    if (result.length > numberTopProcess) result = result.splice(0, numberTopProcess);
    return result;
}

async function topCmdMem() {
    var result = [];
    var info = await osCmd.topMem();
    if (info) {
        let lines = info.split('\n');
        for (let line of lines) {
            if (line.includes('pid')) continue;
            let parts = /^(\d\.\d)(\s\s+)(.*?)(\s+)(.*?)$/gm.exec(line.trim());
            if (!parts || parts.length < 6) continue;
            result.push({
                cmd: parts[5],
                mem: parseFloat(parts[1])
            });
        }
    }
    result = _.sortBy(result, 'mem').reverse();
    if (result.length > numberTopProcess) result = result.splice(0, numberTopProcess);
    return result;
}

function getAllProcess() {
    return new Promise(function (resolve, reject) {
        try {
            ps.get(function (err, processes) {
                if (err) reject(err);
                resolve(processes);
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    GetDeviceInfo: GetDeviceInfo,
    GetLog: GetLog
}