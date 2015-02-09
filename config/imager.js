'use strict';

module.exports = {
    variants: {
        article: {
            resize: {
                large: '1130x',
                medium: '930x',
                small: '710x',
                extraSmall: '700x',
                thumbnailLarge: '266x',
                thumbnailMedium: '446x',
                thumbnailSmall: '710x',
                thumbnailExtraSmall: '480x'
            },
            original: {
                original: true
            }
        }
    },

    storage: {
        Local: {
            provider: 'local',
            path: './public/upload',
            mode: 511
        }
    },

    debug: true
};
