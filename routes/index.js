var express = require('express');
var router = express.Router();
const config = require('config');

const websiteName = config.get('name');
const domain = config.get('domain');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: websiteName,
    website: websiteName,
    domain: domain
  });
});

module.exports = router;
