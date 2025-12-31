
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    REFRESH_TOKEN_PEPPER,
} = require('../../../app/config/env');

const { Unauthorized } = require('../../../app/errors');

const hashRefreshToken = (token) =>
    crypto
        .createHmac('sha256', REFRESH_TOKEN_PEPPER)
        .update(token)
        .digest('hex');

const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

const signRefreshToken = ({ sessionId, userId, expiresIn = JWT_REFRESH_EXPIRES_IN }) =>
    jwt.sign(
        { sid: sessionId, uid: userId, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn }
    );

const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
        throw Unauthorized('Invalid or expired refresh token', 'REFRESH_INVALID');
    }
};

module.exports = {
    hashRefreshToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
};
