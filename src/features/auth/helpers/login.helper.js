// features/auth/helpers/login.helper.js

const repo = require('../auth.repository');
const userPort = require('../adapters/user.pg.adapter');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
    TooManyRequests,
    Unauthorized,
} = require('../../../app/errors');

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS);
const LOGIN_ATTEMPT_WINDOW_MINUTES = Number(process.env.LOGIN_ATTEMPT_WINDOW_MINUTES);

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

const hashRefreshToken = (token) =>
    crypto
        .createHmac('sha256', process.env.REFRESH_TOKEN_PEPPER)
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

const enforceLoginRateLimit = async ({ identifier, ip }) => {
    const failedAttempts = await repo.countFailedLoginAttempts({
        email: identifier,
        ip,
        minutes: LOGIN_ATTEMPT_WINDOW_MINUTES,
    });

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        throw TooManyRequests(
            'Too many login attempts. Try again later.',
            'LOGIN_RATE_LIMIT'
        );
    }
};

const authenticateUser = async ({ identifier, password, ip }) => {
    const authUser = await userPort.findForAuth(identifier);

    if (!authUser) {
        await repo.logLoginAttempt({ email: identifier, ip, success: false });
        throw Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const ok = await bcrypt.compare(password, authUser.passwordHash);
    if (!ok) {
        await repo.logLoginAttempt({ email: identifier, ip, success: false });
        throw Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    await repo.logLoginAttempt({ email: identifier, ip, success: true });
    return authUser;
};

const createSessionAndTokens = async (userId) => {
    const accessToken = signAccessToken(userId);

    const sessionId = crypto.randomUUID();
    const refreshToken = signRefreshToken({ sessionId, userId });

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const expiresAt = new Date(payload.exp * 1000);

    await repo.createSession({
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
