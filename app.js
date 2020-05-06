const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const db = require('./utils/db');

const config = require('config');
const serverName = config.get('name');

var { createNotFoundError, handleError } = require('./routes/error');
var indexRouter = require('./routes/index');
var serversRouter = require('./routes/servers');

var infoRouter = require('./routes/api/info');
var logRouter = require('./routes/api/log');

var app = express();
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/servers', serversRouter);

app.use('/api/info', infoRouter);
app.use('/api/log', logRouter);

// catch 404 and forward to error handler
app.use(createNotFoundError);
app.use(handleError);

console.info(`${serverName} is starting...`);
module.exports = app;