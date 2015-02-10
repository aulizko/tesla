'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var utils = require('../../lib/utils');
var extend = require('util')._extend;

/**
 * Load
 */

exports.load = function (req, res, next, id) {
    Article.load(id, function (err, article) {
        if (err) {
            return next(err);
        }

        if (!article) {
            return next(new Error('Запрашиваемая страница не найдена'));
        }

        req.article = article;
        next();
    });
};

/**
 * List
 */

exports.index = function (req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };

    Article.list(options, function (err, articles) {
        if (err) {
            return res.render('500');
        }

        Article.count().exec(function (errInner, count) {
            if (errInner) {
                return res.render('500');
            }

            res.render('articles/index', {
                articles: articles,
                page: page + 1,
                pages: Math.ceil(count / perPage),
                pageColor: 'yellow'
            });
        });
    });
};

/**
 * New article
 */

exports.new = function (req, res) {
    res.render('articles/form', {
        title: 'Новая статья',
        article: new Article({})
    });
};

/**
 * Create an article
 * Upload an image
 */

exports.create = function (req, res) {
    var article = new Article(req.body);
    var images = req.files.image
        ? [req.files.image]
        : undefined;

    article.user = req.user;

    article.uploadAndSave(images, function (err) {
        if (!err) {
            req.flash('success', 'Статья успешно создана!');
            return res.redirect('/articles/' + article._id);
        }
        console.log(err);
        res.render('articles/form', {
            title: 'Новая статья',
            article: article,
            errors: utils.errors(err.errors || err)
        });
    });
};

/**
 * Edit an article
 */

exports.edit = function (req, res) {
    res.render('articles/form', {
        title: 'Редактирование ' + req.article.title,
        article: req.article
    });
};

/**
 * Update article
 */

exports.update = function (req, res) {
    var article = req.article;
    var images = req.files.image
        ? [req.files.image]
        : undefined;

    // make sure no one changes the user
    delete req.body.user;
    article = extend(article, req.body);

    article.uploadAndSave(images, function (err) {
        if (!err) {
            req.flash('success', 'Статья успешно отредактирована!');
            return res.redirect('/articles/' + article._id);
        }
        console.log(err);
        res.render('articles/form', {
            title: 'Редактирование статьи',
            article: article,
            errors: utils.errors(err.errors || err)
        });
    });
};

/**
 * Show
 */

exports.show = function (req, res) {
    res.render('articles/show', {
        title: req.article.title,
        article: req.article
    });
};

/**
 * Delete an article
 */

exports.destroy = function (req, res) {
    var article = req.article;
    article.remove(function (err) {
        if (err) {
            console.log(err);
            req.flash('error', err);
            return res.redirect(req.session.returnTo ? req.session.returnTo : '/');
        }

        req.flash('info', 'Статья удалена');
        res.redirect('/articles');
    });
};

exports.search = function (req, res) {
    var text = req.query.q ? req.query.q.trim() : null;

    if (!text) {
        return res.render('articles/search', {
            articles: [],
            page: 1,
            pages: 1,
            searchQuery: text
        });
    }

    Article.search(text, function (err, articles) {
        if (err) {
            return res.render('500');
        }

        res.render('articles/search', {
            articles: articles,
            page: 1,
            pages: 1,
            searchQuery: text
        });
    });
};
