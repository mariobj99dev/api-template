const {
    COOKIE_HTTP_ONLY,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    COOKIE_PATH,
} = require('../../../app/config/env');

module.exports = {
    REFRESH_COOKIE_OPTIONS: {
        httpOnly: COOKIE_HTTP_ONLY === true || COOKIE_HTTP_ONLY === 'true',
        secure: COOKIE_SECURE === true || COOKIE_SECURE === 'true',
        sameSite: COOKIE_SAMESITE,
        path: COOKIE_PATH,
    },
};
