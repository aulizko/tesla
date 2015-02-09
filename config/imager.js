'use strict';

module.exports = {
    variants: {
        article: {
            resize: {
                large: '970x',
                medium: '970x',
                small: '740x',
                extraSmall: '480x',
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
