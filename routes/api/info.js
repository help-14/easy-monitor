const Router = require('express-promise-router');
const db = require('../../utils/db');
const { verifyRequest, verifyParam } = require('../../utils/request');

const router = new Router();

router.post('/:serverid', async function (req, res, next) {
    let server = req.params.serverid;

    if (verifyRequest(req) === false || verifyParam(server) === false) {
        res.json({ result: false, msg: 'request invalid' });
        return;
    }

    let data = req.body;
    try {
        await db.query(`INSERT INTO pings(
            cpu, 
            os, 
            ip, 
            time,
            server) 
        VALUES (
            '${data.cpu ? JSON.stringify(data.cpu) : '{}'}',
            '${data.os ? JSON.stringify(data.os) : '{}'}',
            '${data.ip ? data.ip : ''}',
            ${data.time},
            '${server}')`);

        res.json({ result: true });
    } catch (err) {
        console.info(`Request from ${server} to info:`);
        console.info(data);
        console.error(err);

        res.json({ result: false, msg: 'insert to db failed' });
    }
});

module.exports = router;