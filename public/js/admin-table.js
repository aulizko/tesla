'use strict';

var $ = require('jquery');

module.exports = {
    initialize: function () {
        $('body').on('click', '[data-action]', function (e) {
            var $this = $(this);
            var url = $this.attr('href');
            var csrf = $this.data('csrf');

            $.ajax({
                    url: url,
                    method: 'DELETE',
                    data: {
                        _csrf: csrf
                    }
                })
                .done(function () {
                    $this.closest('tr').remove();
                })
                .fail(function (jqXhr, textError, errorThrown) {
                    console.log(textError);
                    console.log(errorThrown);
                });

            e.preventDefault();
            return false;
        });
    }
};
