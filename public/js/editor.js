'use strict';

var $ = require('jquery');
var MediumEditor = require('medium-editor');

module.exports = {
    initialize: function () {
        var isEditorAndTextAreaSynchronized = false;
        var $editorEl = $('#desc');
        var $textArea = $('#desc_content');
        var $form = $editorEl.closest('form');

        var editor = new MediumEditor('#desc', {
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

        $form.on('submit', function (e) {
            if (isEditorAndTextAreaSynchronized) {
                return true;
            } else {
                console.log(editor.serialize());
                $textArea.text($editorEl.html());
                isEditorAndTextAreaSynchronized = true;
                setTimeout(function () {
                    $form.submit();
                }, 50);
                e.preventDefault();
                return false;
            }
        });
    }
};
