var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config.development.js');

var app = express();

// hmr dev server
if (app.get('env') === 'development') {
    var compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath
    }));
    app.use(webpackHotMiddleware(compiler));
}

//, {
//    noInfo: false,
//        quiet: false,
//        publicPath: config.output.publicPath
//}

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', users);
//app.get('*', function(req, res) {
//    res.send({});
//});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// error handlers

// catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function (err, req, res, next) {
//        res.status(err.status || 500);
//        res.send({
//            message: err.message,
//            error: err
//        });
//    });
//}

// production error handler
// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.send({
//        message: err.message,
//        error: {}
//    });
//});

module.exports = app;
