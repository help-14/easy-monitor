const config = require('config');
const Router = require('express-promise-router');
var { GetCacheData } = require('../utils/data');

const websiteName = config.get('name');
const domain = config.get('domain');

const router = new Router();

router.get('/', async function (req, res, next) {
  let result = await GetCacheData();
  res.render('index', {
    title: websiteName,
    website: websiteName,
    domain: domain,
    data: result || []
  });
});

router.get('/json', async function (req, res, next) {
  let result = await GetCacheData();
  if (result)
    res.json(result);
  else
    res.json([]);
});

module.exports = router;
