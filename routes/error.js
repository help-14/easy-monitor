var createError = require('http-errors');

function createNotFoundError(req, res, next) {
    next(createError(404));
}

function handleError(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
}

module.exports = {
    createNotFoundError,
    handleError
}