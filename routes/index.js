const config = require('config');
const Router = require('express-promise-router');
var { GetCacheData } = require('../utils/data');
const { verifyRequest, verifyParam } = require('../utils/request');

const websiteName = config.get('name');
const domain = config.get('domain');
const states = config.get('states');

const router = new Router();

router.get('/', async function (req, res, next) {
  let keyword = req.params.filter ? req.params.filter : req.param('filter');
  if (!verifyParam(keyword)) keyword = null;

  let result = await GetCacheData();
  if (keyword) {
    keyword = keyword.toLowerCase().trim();
    result = result.filter(x => x.id.toLowerCase().includes(keyword) || x.name.toLowerCase().includes(keyword));
  }

  res.render('index', {
    title: websiteName,
    website: websiteName,
    domain: domain,
    states: states,
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
