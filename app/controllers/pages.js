'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Page = mongoose.model('Page');
var utils = require('../../lib/utils');
var extend = require('util')._extend;

/**
 * Load
 */

exports.loadBySlug = function (req, res, next, slug) {
    Page.loadBySlug(slug, function (err, page) {
        if (err) {
            return next(err);
        }

        if (!page) {
            return next(new Error('Запрашиваемая страница не найдена'));
        }

        req.page = page;
        next();
    });
};

exports.loadById = function (req, res, next, id) {
    Page.loadById(id, function (err, article) {
        if (err) {
            return next(err);
        }

        if (!article) {
            return next(new Error('Запрашиваемая страница не найдена'));
        }

        req.page = article;
        next();
    });
};

/**
 * List
 */

exports.admin = function (req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };

    Page.list(options, function (err, articles) {
        if (err) {
            return res.render('500');
        }

        Page.count().exec(function (errInner, count) {
            if (errInner) {
                return res.render('500');
            }

            res.render('pages/admin', {
                entries: articles,
                page: page + 1,
                pages: Math.ceil(count / perPage),
                layout: 'admin'
            });
        });
    });
};

/**
 * New page
 */

exports.new = function (req, res) {
    res.render('pages/form', {
        title: 'Новая страница',
        page: new Page({})
    });
};

/**
 * Create a page
 * Upload an image
 */

exports.create = function (req, res) {
    var page = new Page(req.body);
    var images = req.files.image
        ? [req.files.image]
        : undefined;

    page.user = req.user;
    page.uploadAndSave(images, function (err) {
        if (!err) {
            req.flash('success', 'Страница успешно создана!');
            return res.redirect('/' + page.slug);
        }
        console.log(err);
        res.render('pages/form', {
            title: 'Новая страница',
            page: page,
            errors: utils.errors(err.errors || err)
        });
    });
};

/**
 * Edit an article
 */

exports.edit = function (req, res) {
    res.render('pages/form', {
        title: 'Редактирование ' + req.page.title,
        page: req.page
    });
};

/**
 * Update article
 */

exports.update = function (req, res) {
    var page = req.page;
    var images = req.files.image
        ? [req.files.image]
        : undefined;

    // make sure no one changes the user
    delete req.body.user;
    page = extend(page, req.body);

    page.uploadAndSave(images, function (err) {
        if (!err) {
            return res.redirect('/' + page.slug);
        }

        res.render('pages/form', {
            title: 'Редактирование ' + req.page.title,
            page: page,
            errors: err.errors || err
        });
    });
};

/**
 * Show
 */

exports.show = function (req, res) {
    res.render('pages/show', {
        title: req.page.title,
        page: req.page,
        pageColor: req.page.color
    });
};

exports.mainPage = function (req, res, next) {
    Page.loadBySlug('index', function (err, page) {
        if (err) {
            return next(err);
        }

        if (!page) {
            return next(new Error('Запрашиваемая страница не найдена'));
        }

        req.page = page;
        res.render('pages/show', {
            title: req.page.title,
            page: req.page,
            pageColor: req.page.color
        });
    });

};

/**
 * Delete an article
 */

exports.destroy = function (req, res) {
    var page = req.page;
    page.remove(function (err) {
        if (err) {
            console.log(err);
            req.flash('error', err);
            return res.redirect(req.session.returnTo ? req.session.returnTo : '/');
        }

        req.flash('info', 'Страница удалена');
        res.redirect('/');
    });
};
