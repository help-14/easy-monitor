const Router = require('express-promise-router');
const { GetCacheData } = require('../../utils/data');
const router = new Router();

router.get('/cpu/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'cpu');
});

router.get('/memory/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'memory');
});

router.get('/disk/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'disk');
});

router.get('/uptime/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'uptime');
});

router.get('/process/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'process');
});

router.get('/openFiles/:serverid', async function (req, res, next) {
    await ProcessRequest(res, req.params.serverid, 'openFiles');
});

async function ProcessRequest(res, server, property) {
    let percentMark = ['cpu', 'memory', 'disk'];
    let cacheData = await GetCacheData();
    for (let info of cacheData) {
        if (info.id === server) {
            if (percentMark.includes(property))
                res
                    .status(info[property] < 90 ? 200 : 210)
                    .json({ result: Math.floor(info[property]) + ' %' });
            else
                res.json({ result: info[property] });
            return;
        }
    }
    res.json({ result: 'not found' });
}

module.exports = router;