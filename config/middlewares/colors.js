'use strict';

var colorized = require('../../app/mixins/colorized.js');

module.exports = function (req, res, next) {
    res.locals.availableColors = colorized.AVAILABLE_COLORS;
    next();
};
