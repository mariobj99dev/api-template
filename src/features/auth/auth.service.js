// features/auth/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userPort = require('./adapters/user.pg.adapter');
const repo = require('./auth.repository');

const {
    BadRequest,
    Conflict,
    NotFound
} = require('../../app/errors');

const {
    enforceLoginRateLimit,
    authenticateUser,
    createSessionAndTokens,
} = require('./helpers/login.helper');

const {
    verifyRefreshToken,
    loadValidSession,
    rotateTokens,
} = require('./helpers/refresh.helper');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

exports.register = async ({ email, password, username }) => {
    const exists = await userPort.existsByEmail(email);
    if (exists) {
        throw Conflict('Email already in use', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userPort.createForAuth({
        email,
        passwordHash,
        username,
    });

    return {
        message: 'User registered successfully',
        userId: user.id,
    };
};

exports.login = async ({ identifier, password }, { ip } = {}) => {
    if (!ip) {
        throw BadRequest('IP address missing', 'IP_MISSING');
    }

    await enforceLoginRateLimit({ identifier, ip });

    const authUser = await authenticateUser({
        identifier,
        password,
        ip,
    });

    return createSessionAndTokens(authUser.id);
};

exports.refresh = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw BadRequest('Refresh token missing', 'REFRESH_MISSING');
    }

    const payload = verifyRefreshToken(refreshToken);
    const session = await loadValidSession(payload);

    return rotateTokens({ session, refreshToken });
};

exports.logout = async ({ refreshToken }) => {
    if (!refreshToken) return { message: 'Logged out' };

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        if (payload?.sid) {
            await repo.revokeSession({ sessionId: payload.sid, reason: 'logout' });
        }
    } catch {
        // idempotente
    }

    return { message: 'Logged out' };
};

exports.me = async (userId) => {
    const user = await userPort.findPublicProfileById(userId);

    if (!user) {
        throw NotFound('User not found', 'USER_NOT_FOUND');
    }

    return user;
};
