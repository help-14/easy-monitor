var express = require('express');
var router = express.Router();
const config = require('config');

const websiteName = config.get('name');
const domain = config.get('domain');
const monitoror = config.get('monitoror');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: websiteName,
    website: websiteName,
    domain: domain,
    monitoror: monitoror
  });
});

module.exports = router;
