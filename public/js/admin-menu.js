'use strict';

var $ = require('jquery');

module.exports = {
    initialize: function () {
        var $toggle = $('.admin-menu__toggle');
        var $menu = $('.admin-menu__nav');

        $toggle.click(function (e) {
            $toggle.hide();
            $menu.show();

            e.preventDefault();
            return false;
        });

        $menu.mouseleave(function () {
            $toggle.show();
            $menu.hide();
        });
    }
};
