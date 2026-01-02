const crypto = require('crypto');

const userPort = require('../../users/ports/user.port');
const loginAttemptsPort = require('../ports/loginAttempts.port');
const sessionPort = require('../ports/session.port');

const { verifyPassword } = require('./password.helper');
const {
    signAccessToken,
    signRefreshToken,
    hashRefreshToken,
} = require('./tokens.helper');

const { Unauthorized, TooManyRequests } = require('../../../app/errors');
const logger = require('../../../app/config/logger');

const {
    MAX_LOGIN_ATTEMPTS,
    LOGIN_ATTEMPT_WINDOW_MINUTES,
} = require('../../../app/config/env');

const enforceLoginRateLimit = async ({ identifier, ip }) => {
    const failedAttempts = await loginAttemptsPort.countFailedLoginAttempts({
        identifier,
        ip,
        minutes: LOGIN_ATTEMPT_WINDOW_MINUTES,
    });

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        logger.warn({ identifier, ip }, 'Login rate limit exceeded');
        throw TooManyRequests('Too many login attempts', 'LOGIN_RATE_LIMIT');
    }
};

const authenticateUser = async ({ identifier, password, ip }) => {
    const user = await userPort.findForAuth(identifier);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        await loginAttemptsPort.logLoginAttempt({ identifier, ip, success: false });
        throw Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    await loginAttemptsPort.logLoginAttempt({ identifier, ip, success: true });
    return user;
};

const createSessionAndTokens = async (userId) => {
    const sessionId = crypto.randomUUID();

    const refreshToken = signRefreshToken({ sessionId, userId });
    const accessToken = signAccessToken(userId);

    const payload = require('jsonwebtoken').decode(refreshToken);
    const expiresAt = new Date(payload.exp * 1000);

    await sessionPort.createSession({
        sessionId,
        userId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt,
    });

    return { accessToken, refreshToken };
};

module.exports = {
    enforceLoginRateLimit,
    authenticateUser,
    createSessionAndTokens,
};