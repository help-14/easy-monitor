var express = require('express');
var router = express.Router();
const config = require('config');
const { GetIp } = require('../utils/helper');

const websiteName = config.get('name');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: websiteName,
    website: websiteName,
    ip: GetIp()
  });
});

module.exports = router;
