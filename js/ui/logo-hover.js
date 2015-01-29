var $ = require('jquery');
var _ = require('lodash');
var classList = ['green', 'pink', 'yellow', 'blue', 'red', 'orange', 'purple'];

module.exports = {
    init: function () {
        $('.logo').mouseenter(function (e) {
            var classes = this.className.split(' ');
            var currentNeonColor = _.intersection(classes, classList);
            var newNeonColor = _.sample(classList.splice(classList.indexOf(currentNeonColor), 1));
            
            $(this).removeClass(currentNeonColor).addClass(newNeonColor);
        });
    }
};