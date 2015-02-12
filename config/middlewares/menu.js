'use strict';

var mongoose = require('mongoose');
var MenuItem = mongoose.model('MenuItem');

module.exports = function (req, res, next) {
    MenuItem.loadTree(function (err, data) {
        if (err) {
            return next(err);
        }

        res.locals.menu = data;
        next();
    });
};
