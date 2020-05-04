const Router = require('express-promise-router');
const db = require('../../utils/db');
const { UpdateCacheData, GetServerCache, ClearCache } = require('../../utils/data');
const { verifyRequest, verifyParam } = require('../../utils/request');

const router = new Router();

router.post('/:serverid', async function (req, res, next) {
    let server = req.params.serverid;

    if (verifyRequest(req) === false || verifyParam(server) === false) {
        res.json({ result: false, msg: 'request invalid' });
        return;
    }

    let serverCache = GetServerCache(server);
    if (!serverCache) {
        let dbData = await db.query(`SELECT * FROM servers WHERE identifier='${server}'`);
        if (dbData && dbData.rows.length > 0) {
        } else {
            await db.query(`INSERT INTO servers(
                name, 
                identifier) 
            VALUES (
                '${server}',
                '${server}')`);
        }
        ClearCache();
    }

    let data = req.body;
    if (data.cpu && data.cpu.usage)
        UpdateCacheData(server, 'cpu', data.cpu.usage);
    if (data.memory && data.memory.usedMemMb && data.memory.totalMemMb)
        UpdateCacheData(server, 'memory', (data.memory.usedMemMb / data.memory.totalMemMb) * 100);
    if (data.network && data.network.total) {
        UpdateCacheData(server, 'networkInput', data.network.total.inputMb);
        UpdateCacheData(server, 'networkOutput', data.network.total.outputMb);
    }
    if (data.disk && data.disk.usedPercentage)
        UpdateCacheData(server, 'disk', data.disk.usedPercentage);
    if (data.os && data.os.uptime)
        UpdateCacheData(server, 'uptime', data.os.uptime);
    if (data.process && data.process.total)
        UpdateCacheData(server, 'process', data.process.total);
    if (data.file && data.file.open)
        UpdateCacheData(server, 'openFiles', data.file.open);

    try {
        await db.query(`INSERT INTO logs(
            cpu, 
            memory, 
            network, 
            disk, 
            os, 
            process, 
            file, 
            time,
            server) 
        VALUES (
            '${data.cpu ? JSON.stringify(data.cpu) : '{}'}',
            '${data.memory ? JSON.stringify(data.memory) : '{}'}',
            '${data.network ? JSON.stringify(data.network) : '{}'}',
            '${data.disk ? JSON.stringify(data.disk) : '{}'}',
            '${data.os ? JSON.stringify(data.os) : '{}'}',
            '${data.process ? JSON.stringify(data.process) : '{}'}',
            '${data.file ? JSON.stringify(data.file) : '{}'}',
            ${data.time},
            '${server}')`);

        res.json({ result: true });
    } catch (err) {
        console.info(`Request from ${server} to logs:`);
        console.info(data);
        console.error(err);

        res.json({ result: false, msg: 'insert to db failed' });
    }
});

module.exports = router;