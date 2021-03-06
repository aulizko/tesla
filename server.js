'use strict';

var express = require('express');
var passport = require('passport');
var fs = require('fs');
var mongoose = require('mongoose');
var config = require('config');
var path = require('path');
var app = express();
var socketName = process.env.SOCKET || 3000; // use 3000 port for development

// Connect to mongodb
var connect = function () {
    var options = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };
    mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(path.join(__dirname, '/app/models')).forEach(function (file) {
    if (file.indexOf('.js') !== -1) {
        require(path.join(__dirname, '/app/models/', file));
    }
});

app.set('siteTitle', config.SITE_TITLE);

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport);

var sitemap = require('./config/sitemap')(app, config);

// Bootstrap routes
require('./config/routes')(app, passport, sitemap);

var httpServer = app.listen(socketName);
console.log('Express app started on socket ' + socketName);
/*eslint-disable */
process.on('SIGTERM', function () {
    console.log('Received kill signal (SIGTERM), shutting down gracefully.');
    httpServer.close(function () {
        console.log('Closed out remaining connections.');
        process.exit();
    });

    setTimeout(function () {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30 * 1000);
});
/*eslint-enable */
module.exports = app;
