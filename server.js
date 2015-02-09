'use strict';

var express = require('express');
var passport = require('passport');
var fs = require('fs');
var mongoose = require('mongoose');
var config = require('config');
var path = require('path');
var app = express();
var port = process.env.PORT || 3000;

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

app.listen(port);
console.log('Express app started on port ' + port);

module.exports = app;
