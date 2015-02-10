'use strict';

var users = require('users');
var articles = require('articles');
var pages = require('pages');
var auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
var pageAuth = [auth.requiresLogin, auth.page.hasAuthorization];

/**
 * Expose routes
 */

module.exports = function (app, passport, sitemap) {

    // user routes
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout);
    app.post('/users', users.create);
    app.post('/users/session',
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
        }), users.session);
    app.get('/users/:userId', users.show);

    app.get('/sitemap.xml', sitemap);

    app.param('userId', users.load);

    // article routes
    app.param('id', articles.load);
    app.get('/articles', articles.index);
    app.get('/articles/new', auth.requiresLogin, articles.new);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/page/:page', articles.index);
    app.get('/articles/:id', articles.show);
    app.get('/articles/:id/edit', articleAuth, articles.edit);
    app.put('/articles/:id', articleAuth, articles.update);
    app.delete('/articles/:id', articleAuth, articles.destroy);
    app.get('/search', articles.search);
    app.get('/page/:page', articles.index);

    // home route
    app.get('/', articles.index);

    // page routes
    app.param('slug', pages.loadBySlug);
    app.param('pageId', pages.loadById);
    app.get('/admin/pages', auth.requiresLogin, pages.admin);
    app.get('/pages/new', auth.requiresLogin, pages.new);
    app.post('/pages', auth.requiresLogin, pages.create);
    app.get('/pages/:pageId/edit', pageAuth, pages.edit);
    app.put('/pages/:pageId', pageAuth, pages.update);
    app.delete('/pages/:pageId', pageAuth, pages.destroy);

    // Очень уж глобальная штука, может отловить все, поэтому отправляется в самый низ конфига
    app.get('/:slug', pages.show);

    /**
     * Error handling
     */
    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (err.message.indexOf('не найдена') !== -1
            || (err.message.indexOf('Cast to ObjectId failed') !== -1))) {
            return next();
        }
        console.error(err.stack);
        // error page
        res.status(500).render('500', {error: err.stack});
    });

    // assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Запрашиваемая страница не найдена'
        });
    });
};
