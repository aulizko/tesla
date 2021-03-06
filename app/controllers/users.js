'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var utils = require('../../lib/utils');
var extend = require('util')._extend;

/**
 * Helper function
 */
function login(req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}

exports.load = function (req, res, next, id) {
    var options = {
        criteria: {_id: id}
    };
    User.load(options, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('Пользователя с таким id не существует ' + id));
        }
        req.profile = user;
        next();
    });
};

/**
 * Create user
 */

exports.create = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function (err) {
        if (err) {
            return res.render('users/signup', {
                errors: utils.errors(err.errors),
                user: user,
                title: 'Регистрация',
                layout: 'auth'
            });
        }

        // manually login the user once successfully signed up
        return req.logIn(user, function (errInner) {
            /*global next*/
            if (errInner) {
                return next(errInner);
            }
            return res.redirect('/');
        });
    });
};

/**
 *  Show profile
 */

exports.show = function (req, res) {
    var user = req.profile;
    res.render('users/show', {
        title: user.name,
        user: user
    });
};

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect(req.session.returnTo ? req.session.returnTo : '/');
    }

    res.render('users/login', {
        title: 'Вход',
        layout: 'auth'
    });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect(req.session.returnTo ? req.session.returnTo : '/');
    }

    res.render('users/signup', {
        title: 'Регистрация',
        user: new User(),
        layout: 'auth'
    });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};

exports.edit = function (req, res) {
    return res.render('users/form', {
        layout: 'admin',
        title: 'Изменение пароля',
        profile: req.profile
    });
};

exports.update = function (req, res) {
    var user = req.profile;
    user = extend(user, req.body);
    user.save(function (err) {
        if (!err) {
            return res.redirect(req.session.returnTo ? req.session.returnTo : '/');
        }

        return res.render('users/form', {
            layout: 'admin',
            title: 'Изменение пароля',
            profile: req.profile,
            errors: utils.errors(err.errors || err)
        });
    });
};

/**
 * Session
 */

exports.session = login;
