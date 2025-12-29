const service = require('./google.service');
const { REFRESH_COOKIE_OPTIONS } = require('../../helpers/refreshCookieOptions.helper');

exports.start = async (req, res) => {
    const { url, state } = service.getAuthUrl();

    // CSRF state en cookie corta (10 min)
    res.cookie('google_oauth_state', state, {
        httpOnly: true,
        secure: REFRESH_COOKIE_OPTIONS.secure,
        sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
        maxAge: 10 * 60 * 1000,
        path: '/auth/google/callback',
    });

    return res.redirect(url);
};

exports.callback = async (req, res) => {
    const { code, state } = req.query;

    const stateCookie = req.cookies.google_oauth_state;
    res.clearCookie('google_oauth_state', { path: '/auth/google/callback' });

    const { accessToken, refreshToken } = await service.handleCallback({
        code,
        state,
        stateCookie,
    });

    return res
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ accessToken });
};
