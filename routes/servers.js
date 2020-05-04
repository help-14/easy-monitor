const Router = require('express-promise-router');
const config = require('config');
const db = require('../utils/db');
const { GetCacheFormatData } = require('../utils/data');
const { verifyRequest, verifyParam } = require('../utils/request');

const websiteName = config.get('name');
const domain = config.get('domain');

const router = new Router();

router.get('/', async function (req, res, next) {
    let data = await GetCacheFormatData();
    res.render('servers', {
        title: `Server list - ${websiteName}`,
        website: websiteName,
        domain: domain,
        data: data,
    });
});

router.get('/json', async function (req, res, next) {
    let result = await GetCacheFormatData();
    if (result)
        res.json(result);
    else
        res.json([]);
});

router.get('/:serverid', async function (req, res, next) {
    var server = req.params.serverid;
    if (verifyParam(server) === false) {
        res.json({ result: 'invalid' });
        return;
    }

    res.render('server', {
        title: `Server info - ${websiteName}`,
        website: websiteName,
        domain: domain,
        data: data,
    });
});

module.exports = router;
