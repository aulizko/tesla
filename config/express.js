'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var csrf = require('csurf');
var multer = require('multer');
var flash = require('connect-flash');

var MongoStore = require('connect-mongo')(session);
var config = require('config');
var pkg = require('../package.json');
var menu = require('middlewares/menu.js');
var colors = require('middlewares/colors.js');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

    app.disable('etag');

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    app.use(express.static(config.root + '/public'));

    // Use winston on production
    var log;
    if (env !== 'development') {
        log = 'combined';
    } else {
        log = 'dev';
    }

    // Don't log during tests
    // Logging middleware
    if (env !== 'test') {
        app.use(morgan(log));
    }

    // view engine setup
    require('viewEngine')(app);

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(multer());
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    // CookieParser should be above session
    app.use(cookieParser());
    app.use(cookieSession({
        secret: 'secret'
    }));
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: pkg.name,
        store: new MongoStore({
            url: config.db,
            collection: 'sessions'
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // expose user to views
    app.use(function (req, res, next) {
        res.locals.user = req.user;
        res.locals.authenticated = req.isAuthenticated();
        next();
    });

    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    app.use(menu);
    app.use(colors);

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
        app.use(csrf());

        // This could be moved to view-helpers :-)
        app.use(function (req, res, next) {
            res.locals.csrfToken = req.csrfToken();
            next();
        });
    }
};
