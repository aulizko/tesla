'use strict';

var $ = require('jquery');
var MediumEditor = require('medium-editor');

function initializeEditor() {
    return new MediumEditor('#desc', {
        anchorInputPlaceholder: 'Вставьте ссылку',
        forcePlainText: false,
        placeholder: 'Введите текст',
        buttons: [
            'bold',
            'italic',
            'anchor',
            'header1',
            'header2',
            'unorderedlist',
            'orderedlist',
            'quote'
        ]
    });
}

module.exports = {
    initialize: function () {
        initializeEditor();

        $('#desc').on('input', function () {
            $('#desc_content').text($(this).html());
        });
    }
};
