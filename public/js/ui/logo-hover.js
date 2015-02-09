'use strict';

var $ = require('jquery');
var _ = require('lodash');
var classList = ['green', 'pink', 'yellow', 'blue', 'red', 'orange', 'purple'];
var $body = $('body');
var lock = false;

module.exports = {
    init: function () {
        $('.logo').click(function (e) {
            if (lock) {
                return false;
            }

            var classes = $body[0].className.split(' ');
            var currentNeonColor = _.intersection(classes, classList)[0];
            var newNeonColor = _.sample(_.without(classList, currentNeonColor));

            lock = true;

            requestAnimationFrame(function () {
                $body.removeClass(currentNeonColor).addClass(newNeonColor);
                lock = false;
            });

            e.preventDefault();
            return false;
        });
    }
};
