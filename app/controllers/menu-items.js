'use strict';

var mongoose = require('mongoose');
var MenuItem = mongoose.model('MenuItem');
var utils = require('../../lib/utils');
var extend = require('util')._extend;

exports.load = function (req, res, next, id) {
    MenuItem.loadById(id, function (err, menuItem) {
        if (err) {
            return next(err);
        }

        if (!menuItem) {
            return next(new Error('Запрашиваемая страница не найдена'));
        }

        req.menuItem = menuItem;
        return next();
    });
};

exports.new = function (req, res, next) {
    MenuItem.root(function (err, rootMenuItems) {
        if (err) {
            console.log(err);
            return next(err);
        }

        return res.render('menu/form', {
            title: 'Новый пункт меню',
            menuItem: new MenuItem({}),
            rootMenuItems: rootMenuItems,
            layout: 'admin'
        });
    });
};

exports.create = function (req, res, next) {
    var menuItem = new MenuItem(req.body);

    if (!req.body.parent) {
        menuItem.parent = null;
    }
    menuItem.save(function (menuItemSaveError) {
        if (!menuItemSaveError) {
            req.flash('success', 'Новый пункт меню успешно создан!');
            return res.redirect('/admin/menuItems');
        }

        MenuItem.root(function (rootMenuItemsLoadError, rootMenuItems) {
            if (rootMenuItemsLoadError) {
                return next(rootMenuItemsLoadError);
            }

            return res.render('menu/form', {
                title: 'Новый пункт меню',
                errors: utils.errors(menuItemSaveError.errors),
                menuItem: menuItem,
                rootMenuItems: rootMenuItems,
                layout: 'admin'
            });
        });
    });
};

exports.edit = function (req, res, next) {
    MenuItem.root(function (err, rootMenuItems) {
        if (err) {
            console.log(err);
            return next(err);
        }

        return res.render('menu/form', {
            title: 'Редактирование пункта меню ' + req.menuItem.title,
            menuItem: req.menuItem,
            rootMenuItems: rootMenuItems,
            layout: 'admin'
        });
    });

};

exports.update = function (req, res) {
    var menuItem = req.menuItem;
    menuItem = extend(menuItem, req.body);

    menuItem.save(function (err) {
        if (!err) {
            req.flash('success', 'Пункт меню успешно отредактирован!');
            return res.redirect('/admin/menuItems');
        }

        console.log(err);
        return res.render('menu/form', {
            title: 'Редактирование пункта меню',
            article: menuItem,
            errors: utils.errors(err.errors || err)
        });
    });
};

exports.admin = function (req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };

    MenuItem.list(options, function (err, menuItems) {
        if (err) {
            return res.render('500');
        }

        MenuItem.count().exec(function (errInner, count) {
            if (errInner) {
                return res.render('500');
            }

            res.render('menu/admin', {
                entries: menuItems,
                title: 'Список пунктов меню',
                page: page + 1,
                pages: Math.ceil(count / perPage),
                layout: 'admin'
            });
        });
    });
};

exports.destroy = function (req, res) {
    var menuItem = req.menuItem;
    menuItem.remove(function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send({
                error: err
            });
        }

        return res.status(200).send({
            info: 'success'
        });
    });
};
