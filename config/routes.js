'use strict';

var users = require('users');
var articles = require('articles');
var pages = require('pages');
var auth = require('./middlewares/authorization');
var menuItems = require('menu-items');

/**
 * Expose routes
 */

module.exports = function (app, passport, sitemap) {

    // user routes
    app.param('userId', users.load);
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout);
    app.post('/users', users.create);
    app.post('/users/session',
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
        }), users.session);
    app.get('/users/:userId/edit', [auth.requiresLogin, auth.user.hasAuthorization], users.edit);
    app.put('/users/:userId', [auth.requiresLogin, auth.user.hasAuthorization], users.update);

    app.get('/sitemap.xml', sitemap);

    // article routes
    app.param('id', articles.load);
    app.get('/articles', articles.index);
    app.get('/articles/new', auth.requiresLogin, articles.new);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/page/:page', articles.index);
    app.get('/articles/:id', articles.show);
    app.get('/articles/:id/edit', auth.requiresLogin, articles.edit);
    app.put('/articles/:id', auth.requiresLogin, articles.update);
    app.delete('/articles/:id', auth.requiresLogin, articles.destroy);
    app.get('/search', articles.search);
    app.get('/articles/page/:page', articles.index);
    app.get('/admin/articles', auth.requiresLogin, articles.admin);

    app.param('menuItemId', menuItems.load);
    app.get('/menuItems/new', auth.requiresLogin, menuItems.new);
    app.post('/menuItems', auth.requiresLogin, menuItems.create);
    app.get('/admin/menuItems', auth.requiresLogin, menuItems.admin);
    app.delete('/menuItems/:menuItemId', auth.requiresLogin, menuItems.destroy);
    app.get('/menuItems/:menuItemId/edit', auth.requiresLogin, menuItems.edit);
    app.put('/menuItems/:menuItemId', auth.requiresLogin, menuItems.update);
    // home route
    app.get('/', pages.mainPage);

    // page routes
    app.param('slug', pages.loadBySlug);
    app.param('pageId', pages.loadById);
    app.get('/admin/pages', auth.requiresLogin, pages.admin);
    app.get('/pages/new', auth.requiresLogin, pages.new);
    app.post('/pages', auth.requiresLogin, pages.create);
    app.get('/pages/:pageId/edit', auth.requiresLogin, pages.edit);
    app.put('/pages/:pageId', auth.requiresLogin, pages.update);
    app.delete('/pages/:pageId', auth.requiresLogin, pages.destroy);

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
        return res.status(500).render('500', {error: err.stack});
    });

    // assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Запрашиваемая страница не найдена'
        });
    });
};
