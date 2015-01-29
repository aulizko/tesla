var $ = require('jquery');
var _ = require('lodash');
var classList = ['green', 'pink', 'yellow', 'blue', 'red', 'orange', 'purple'];
var $body = $('body');
var block = false;

module.exports = {
    init: function () {
        $('.logo').click(function (e) {
            if (block) {
                return;
            }
            
            var classes = $body[0].className.split(' ');
            var currentNeonColor = _.intersection(classes, classList)[0];
            console.log(currentNeonColor);
            var newNeonColor = _.sample(_.without(classList, currentNeonColor));
            console.log(newNeonColor);
            block = true;
            
            requestAnimationFrame(function () {
                $body.removeClass(currentNeonColor).addClass(newNeonColor);
                block = false;
            });
            
            e.preventDefault();
            return false;
        });
    }
};