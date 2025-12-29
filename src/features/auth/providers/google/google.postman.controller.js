
const service = require('./google.service');
const {REFRESH_COOKIE_OPTIONS} = require('../../helpers/refreshCookieOptions.helper')
exports.postmanLogin = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Missing Google token',
            code: 'GOOGLE_TOKEN_MISSING',
        });
    }

    const googleToken = authHeader.split(' ')[1];

    const { accessToken, refreshToken } =
        await service.handleGoogleTokenForPostman(googleToken);

    return res
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ accessToken });
};