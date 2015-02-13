'use strict';

var moment = require('moment');
moment.locale('ru');
var gravatar = require('gravatar');
var config = require('config');

var RactiveViewEngine = require('../lib/RactiveViewEngine');
var _ = require('lodash');

var colorized = require('../app/mixins/colorized.js');

module.exports = function (app) {
    var ractiveViewEngine = new RactiveViewEngine({
        defaultLayout: 'layout-default',
        helpers: {
            currentYear: function () {
                return (new Date()).getFullYear();
            },

            humanDate: function (date) {
                return moment(date).format('Do MMMM YYYY');
            },

            timeAgo: function (date) {
                return moment(date).fromNow();
            },

            siteTitle: app.get('siteTitle'),

            generatePagination: function (currentPage, pageCount) {
                if (!pageCount || pageCount <= 1) {
                    return '';
                }
                var result = '<div class="paginator__wrapper">' +
                    '<div class="paginator"><div class="paginator__header">Страницы: </div><ul>';

                var links = _.map(_.range(1, pageCount + 1 > 10 ? 11 : pageCount + 1), function (page) {
                    var linkHtml = '<li class="page';
                    if (page === currentPage) {
                        linkHtml += ' active';
                    }

                    linkHtml += '">';
                    linkHtml += '<a href="/page/' + page + '">' + page + '</a>';
                    linkHtml += '</li>';
                    return linkHtml;
                });

                result += links.join('');
                result += '</ul></div></div>';

                return result;
            },

            getProfilePictureUrl: function (user) {
                if (user.email) {
                    return gravatar.url(user.email, {s: '64', r: 'g', d: 'mm'});
                } else {
                    return '';
                }
            },

            colorizePage: function (colorName) {
                if (colorName) {
                    return colorName;
                } else {

                    return _.sample(colorized.VALID_COLORS);
                }
            }
        }
    });

    app.engine('html', ractiveViewEngine.engine);
    app.set('view engine', 'html');
    app.set('views', config.root + '/views');
};
