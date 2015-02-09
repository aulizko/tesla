'use strict';

var SiteMap = require('sitemap');
var _ = require('lodash');

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var User = mongoose.model('User');
var Page = mongoose.model('Page');

module.exports = function(app, config) {
    var frequency = {
        ALWAYS: 'always',
        HOURLY: 'hourly',
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
        YEARLY: 'yearly',
        NEVER: 'never'
    };


    var sitemap = SiteMap.createSitemap({
        hostname: 'http://' + config.siteDomain,
        cacheTime: 600 * 1000, // 600 секунд или десять минут
        urls: [
            {
                url: '/', // Главная
                changefreq: frequency.DAILY,
                priority: 0.8
            },
            {
                url: '/login', // Вход
                changefreq: frequency.NEVER,
                priority: 0.1
            },
            {
                url: '/signup', // Регистрация
                changefreq: frequency.NEVER,
                priority: 0.1
            }
        ]
    });

    Article.all(function(err, articles) {
        if (err) {
            throw err;
        }

        var tags = [];

        _.each(articles, function(article) {
            sitemap.add({
                url: '/articles/' + article._id,
                changefreq: frequency.MONTHLY,
                priority: 0.3
            });

            var tagsArray = _.map(article.tags.split(','), function(item) {
                return item.trim();
            });

            tags.push(tagsArray);
        });

        _.each(_.uniq(_.flatten(tags)), function(tag) {
            sitemap.add({
                url: '/tags/' + tag,
                changefreq: frequency.MONTHLY,
                priority: 0.5
            });
        });
    });

    User.all(function(err, users) {
        if (err) {
            throw err;
        }

        _.each(users, function(user) {
            sitemap.add({
                url: '/users/' + user._id,
                changefreq: frequency.YEARLY,
                priority: 0.1
            });
        });
    });

    Page.all(function(err, pages) {
        if (err) {
            throw err;
        }

        _.each(pages, function(page) {
            sitemap.add({
                url: '/' + page.slug,
                changefreq: frequency.YEARLY,
                priority: 0.1
            });
        });
    });

    return function(req, res) {
        sitemap.toXML( function (xml) {
            res.header('Content-Type', 'application/xml');
            res.send( xml );
        });
    };
};
