const Router = require('express-promise-router');
const db = require('../../utils/db');
const { verifyRequest } = require('../../utils/request');

const router = new Router();

router.post('/:serverid', async function (req, res, next) {
    let server = req.params.serverid;

    if (verifyRequest(req) === false) {
        res.json({ result: false, msg: 'request invalid' });
        return;
    }

    let data = req.body;
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