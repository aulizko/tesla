'use strict';

/*
 *  Generic require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.method === 'GET') {
        req.session.returnTo = req.originalUrl;
    }
    res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */
exports.user = {
    hasAuthorization: function (req, res, next) {
        if (req.profile.id !== req.user.id) {
            return res.redirect('/users/' + req.profile.id);
        }
        next();
    }
};

/*
 *  Article authorization routing middleware
 */
exports.article = {
    hasAuthorization: function (req, res, next) {
        if (req.article.user.id !== req.user.id) {
            return res.redirect('/articles/' + req.article.id);
        }
        next();
    }
};

/*
 *  Page authorization routing middleware
 */
exports.page = {
    hasAuthorization: function (req, res, next) {
        if (req.page.user.id !== req.user.id) {
            return res.redirect('/' + req.page.slug);
        }
        next();
    }
};
