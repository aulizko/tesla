'use strict';

exports.schema = {
    color: {
        type: String,
        default: ''
    }
};

var VALID_COLORS = [
    'yellow',
    'green',
    'pink',
    'blue',
    'red',
    'orange',
    'purple'
];

exports.VALID_COLORS = VALID_COLORS;

exports.AVAILABLE_COLORS = [
    {
        title: 'желтый',
        value: 'yellow'
    },
    {
        title: 'зеленый',
        value: 'green'
    },
    {
        title: 'сиреневый',
        value: 'pink'
    },
    {
        title: 'синий',
        value: 'blue'
    },
    {
        title: 'красный',
        value: 'red'
    },
    {
        title: 'оранжевый',
        value: 'orange'
    },
    {
        title: 'фиолетовый',
        value: 'purple'
    }
];

exports.validationFunction = function (color, fn) {
    if (this.isNew || this.isModified('color')) {

        fn(!color || VALID_COLORS.indexOf(color) !== -1);
    } else {
        fn(true);
    }
};

exports.validationErrorMessage = 'Неправильный цвет';
