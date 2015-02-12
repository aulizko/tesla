'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Imager = require('imager');
var config = require('config');
var _ = require('lodash');

var imagerConfig = require(config.root + '/config/imager.js');
var sanitizeHtml = require('sanitize-html');

var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var ArticleSchema = new Schema({
    title: {type: String, default: '', trim: true},
    body: {type: String, default: '', trim: true},
    user: {type: Schema.ObjectId, ref: 'User'},
    image: {
        cdnUri: String,
        files: []
    },
    published: {
        type: Boolean,
        default: false
    },
    commentable: {
        type: Boolean,
        default: false
    },
    createdAt: {type: Date, default: Date.now}
});

/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'Заголовок статьи не может быть пустым');
ArticleSchema.path('body').required(true, 'Текст статьи не может быть пустым');

/**
 * Pre-remove hook
 */
ArticleSchema.pre('remove', function (next) {
    var imager = new Imager(imagerConfig, 'Local');
    var files = this.image.files;

    // if there are files associated with the item, remove from the cloud too
    imager.remove(files, function (err) {
        if (err) {
            return next(err);
        }
    }, 'article');

    next();
});

ArticleSchema.pre('validate', function (next) {
    this.body = sanitizeHtml(this.body, {
        allowedTags: sanitizeHtml.defaults.allowedTags,
        allowedAttributes: sanitizeHtml.defaults.allowedAttributes
    });
    next();
});

/**
 * Methods
 */
ArticleSchema.methods = {

    /**
     * Save article and upload image
     *
     * @param {Object} images
     * @param {Function} cb
     * @api private
     */
    uploadAndSave: function (images, cb) {
        if (!images || !images.length) {
            return this.save(cb);
        }

        var imager = new Imager(imagerConfig, 'Local');
        var self = this;

        this.validate(function (err) {
            if (err) {
                return cb(err);
            }

            imager.upload(images, function (errInner, cdnUri, files) {
                if (errInner) {
                    return cb(errInner);
                }

                if (files.length) {
                    self.image = {
                        cdnUri: cdnUri,
                        files: files
                    };
                }
                self.save(cb);
            }, 'article');
        });
    },

    truncate: function (text, limit) {
        var chunk = _.unescape(sanitizeHtml(text, {allowedTags: [], allowedAttributes: false})).replace('&nbsp;', '');
        limit = limit || 300;

        chunk = chunk.substr(0, limit);
        var toLong = text.length > limit;

        if (toLong) {
            chunk = chunk.substr(0, Math.min(chunk.length, chunk.lastIndexOf(' ')));
        }

        return toLong ? chunk + '&hellip;' : chunk;
    }
};

/**
 * Statics
 */

ArticleSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({
                _id: id
            })
            .populate('user', 'name email username')
            .exec(cb);
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options.criteria || {};

        this.find(criteria)
            .populate('user', 'name username')
            .sort({createdAt: -1}) // сортируем по дате
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb);
    },

    search: function (text, cb) {
        var criteria = {
            $text: {
                $search: text
            }
        };

        var score = {
            score: {
                $meta: 'textScore'
            }
        };

        this.find(criteria, score).populate('user', 'name username').sort(score).exec(cb);
    },

    all: function (cb) {
        this.find({})
            .sort({createdAt: -1}) // сортируем по дате
            .exec(cb);
    }
};

mongoose.model('Article', ArticleSchema);
