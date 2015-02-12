'use strict';

var mongoose = require('mongoose');
var Imager = require('imager');
var config = require('config');

var imagerConfig = require(config.root + '/config/imager.js');
var sanitizeHtml = require('sanitize-html');
var colorized = require('../mixins/colorized.js');
var _ = require('lodash');

var Schema = mongoose.Schema;

var reservedSlugs = [
    'login',
    'signup',
    'logout',
    'users',
    'user',
    'session',
    'auth',
    'articles',
    'article',
    'page',
    'tags',
    'pages'
];

var reservedSlugsRegex = new RegExp(reservedSlugs.join('|'), 'ig');

/**
 * Page Schema
 */

var PageSchema = new Schema(_.assign({}, colorized.schema, {
    title: {
        type: String,
        default: '',
        trim: true
    },
    body: {
        type: String,
        default: '',
        trim: true
    },
    slug: {
        type: String,
        default: '',
        trim: true
    },
    user: {type: Schema.ObjectId, ref: 'User'},
    image: {
        cdnUri: String,
        files: []
    },
    createdAt: {type: Date, default: Date.now}
}));

/**
 * Validations
 */

PageSchema.path('title').required(true, 'Заголовок страницы не может быть пустым');
PageSchema.path('body').required(true, 'Текст страницы не может быть пустым');
PageSchema.path('slug').validate(function (slug, fn) {
    var Page = mongoose.model('Page');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('slug')) {
        Page.find({slug: slug}).exec(function (err, users) {
            fn(!err && users.length === 0);
        });
    } else {
        fn(true);
    }
}, 'Страница с таким slug уже существует');

PageSchema.path('slug').validate(function (slug, fn) {
    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('slug')) {
        fn(!reservedSlugsRegex.test(slug));
    } else {
        fn(true);
    }
}, 'У страницы не может быть slug в виде одного из перечисленных слов ' + reservedSlugs.join(', '));

PageSchema.path('color').validate(colorized.validationFunction, colorized.validationMessage);

/**
 * Pre-remove hook
 */
PageSchema.pre('remove', function (next) {
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

PageSchema.pre('validate', function (next) {
    this.body = sanitizeHtml(this.body, {
        allowedTags: sanitizeHtml.defaults.allowedTags,
        allowedAttributes: sanitizeHtml.defaults.allowedAttributes
    });
    this.slug = this.slug ? this.slug.toLowerCase() : this.slug;
    next();
});

/**
 * Methods
 */

PageSchema.methods = {

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
                    self.image = {cdnUri: cdnUri, files: files};
                }

                self.save(cb);
            }, 'article');
        });
    }
};

/**
 * Statics
 */

PageSchema.statics = {

    /**
     * Find page by slug
     *
     * @param {String} slug
     * @param {Function} cb
     * @api private
     */

    loadBySlug: function (slug, cb) {
        this.findOne({slug: slug})
            .populate('user', 'name email username')
            .exec(cb);
    },

    /**
     * Find page by slug
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */
    loadById: function (id, cb) {
        this.findOne({_id: id})
            .populate('user', 'name email username')
            .exec(cb);
    },

    /**
     * List pages
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options.criteria || {};

        this.find(criteria)
            .populate('user', 'name username')
            .sort({createdAt: -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb);
    },

    all: function (cb) {
        this.find({})
            .sort({slug: 1}) // сортируем по slug
            .exec(cb);
    }
};

mongoose.model('Page', PageSchema);
