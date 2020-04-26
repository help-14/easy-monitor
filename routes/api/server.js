const Router = require('express-promise-router');
const db = require('../../utils/db');
const { verifyRequest } = require('../../utils/request');
const { hoursToMilisecond } = require('../../utils/converter')

const config = require('config');
const showLastHours = hoursToMilisecond(config.get('showLastHours.cpu'));

const router = new Router();

router.post('/', async function (req, res, next) {
    limitTime = Date.now() - showLastHours;
    let query = `SELECT cpu->>'usage' AS usage, server, time FROM logs WHERE time >= ${limitTime} ORDER BY time DESC`;
    let data = await db.query(query);
    try {
        if (data) {
            res.json({ result: true, data: data });
        } else {
            res.json({ result: false });
        }
    } catch (err) {
        res.json({ result: false, msg: err.message });
    }
});

router.post('/:serverid', async function (req, res, next) {
    let server = req.params.serverid;
    limitTime = Date.now() - showLastHours;
    let query = `SELECT cpu->>usage AS usage, server, time FROM logs WHERE server='${server}' AND time >= ${limitTime} ORDER BY time DESC`;
    let data = await db.query(query);
    try {
        if (data) {
            res.json({ result: true, data: data });
        } else {
            res.json({ result: false });
        }
    } catch (err) {
        res.json({ result: false, msg: err.message });
    }
});

module.exports = router;