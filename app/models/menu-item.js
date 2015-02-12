'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function ignoreEmpty(val) {
    if (val === '') {
        return undefined;
    } else {
        return val;
    }
}

var MenuItemSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    link: {
        type: String,
        default: '',
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    parent: {type: Schema.ObjectId, ref: 'MenuItem', set: ignoreEmpty},
    createdAt: {type: Date, default: Date.now}
});

MenuItemSchema.path('title').required(true, 'Нужно название пункта меню');
MenuItemSchema.path('title').validate(function (title, fn) {
    var MenuItem = mongoose.model('MenuItem');
    // Проверяем только когда это новый пункт меню, или название было изменено
    if (this.isNew || this.isModified('title')) {
        MenuItem.find({title: title}).exec(function (err, users) {
            fn(!err && users.length === 0);
        });
    } else {
        fn(true);
    }
}, 'Пункт меню с таким названием уже существует');

MenuItemSchema.path('link').required(true, 'Укажите, куда ссылается пункт меню');
MenuItemSchema.path('link').validate(function (link, fn) {
    var MenuItem = mongoose.model('MenuItem');
    // Проверяем только когда это новый пункт меню, или ссылка была изменено
    if (this.isNew || this.isModified('link')) {
        MenuItem.find({link: link}).exec(function (err, users) {
            fn(!err && users.length === 0);
        });
    } else {
        fn(true);
    }
}, 'Пункт меню, ссылающийся на то же место, уже существует');

MenuItemSchema.statics = {
    loadById: function (id, cb) {
        this.findOne({_id: id})
            .exec(cb);
    },

    root: function (cb) {
        this.find({parent: null})
            .sort({order: 1})
            .exec(cb);
    },

    list: function (options, cb) {
        var criteria = options.criteria || {};

        this.find(criteria)
            .sort({createdAt: -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb);
    }
};

mongoose.model('MenuItem', MenuItemSchema);
