
const ps = require('current-processes');
var _ = require('lodash');

const osu = require('node-os-utils');
const cpu = osu.cpu;
const drive = osu.drive;
const proc = osu.proc;
const memory = osu.mem;
const netstat = osu.netstat;
const os = osu.os;
const osCmd = osu.osCmd;

async function GetDeviceInfo() {
    let result = {
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
        cpu: {},
        os: {},
        osCmd: {},
        processes: [],
    };

    result.cpu.usage = await cpu.usage();
    result.cpu.loadavg = cpu.loadavg(); // number of task waiting to exec in 1, 5, 15 min

    result.memory = await memory.used();
    result.network = await netstat.inOut();
    result.openfiles = await osu.openfiles.openFd();
    result.totalProcess = await proc.totalProcesses();
    result.zombieProcess = await proc.zombieProcesses();

    result.os.uptime = os.uptime();

    result.osCmd.topCpu = parseOsCmdCpu(await osCmd.topCpu());
    result.osCmd.topMem = parseOsCmdMem(await osCmd.topMem());
    //result.osCmd.vmstats = await osCmd.vmstats();

    try { result.processes = await getAllProcess(); } catch (err) { }
    try { result.drive = await drive.used(); } catch{ }
    return result;
}

function parseOsCmdCpu(info) {
    var result = [];
    if (info) {
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
    }
    result = _.sortBy(result, 'cpu').reverse();
    if (result.length > 5) result = result.splice(0, 5);
    return result;
}

function parseOsCmdMem(info) {
    var result = [];
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
    if (result.length > 5) result = result.splice(0, 5);
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

async function Start() {
    console.log(await GetDeviceInfo());
    let log = await GetLog();
    console.log(JSON.stringify(log));
    console.log('Done');
}

Start();