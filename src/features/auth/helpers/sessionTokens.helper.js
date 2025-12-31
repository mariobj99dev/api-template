
const crypto = require('crypto');

const userPort = require('../../users/ports/user.port');
const sessionPort = require('../ports/session.port');
const loginAttemptsPort = require('../ports/loginAttempts.port');

const { Unauthorized } = require('../../../app/errors');
const { verifyPassword } = require('./password.helper');
const { hashRefreshToken, signAccessToken, signRefreshToken } = require('./tokens.helper');

const authenticateLocalUser = async ({ identifier, password, ip }) => {
    const authUser = await userPort.findForAuth(identifier);

    if (!authUser) {
        await loginAttemptsPort.logLoginAttempt({ identifier, ip, success: false });
        throw Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const ok = await verifyPassword(password, authUser.passwordHash);
    if (!ok) {
        await loginAttemptsPort.logLoginAttempt({ identifier, ip, success: false });
        throw Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    await loginAttemptsPort.logLoginAttempt({ identifier, ip, success: true });
    return authUser;
};

const createSessionAndTokens = async (userId, client = null) => {
    const accessToken = signAccessToken(userId);

    const sessionId = crypto.randomUUID();
    const refreshToken = signRefreshToken({ sessionId, userId });

    // calculamos expiresAt desde el propio refresh token
    const payload = require('jsonwebtoken').decode(refreshToken);
    const expiresAt = new Date(payload.exp * 1000);

    await sessionPort.createSession(
        {
            sessionId,
            userId,
            refreshTokenHash: hashRefreshToken(refreshToken),
            expiresAt,
        },
        client || undefined
    );

    return { accessToken, refreshToken };
};

module.exports = {
    authenticateLocalUser,
    createSessionAndTokens,
};
