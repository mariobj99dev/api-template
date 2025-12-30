// features/auth/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userPort = require('./ports/user.port');
const userProfilePort = require('../profile/ports/userProfile.port');
const transactionPort = require('./ports/transaction.port');
const repo = require('./auth.repository');

const logger = require('../../app/config/logger')

const {
    SALT_ROUNDS,
    JWT_REFRESH_SECRET,
} = require('../../app/config/env');

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

exports.login = async ({ identifier, password }, { ip } = {}) => {
    if (!ip) {
        logger.warn({ identifier }, 'Login attempt without IP');
        throw BadRequest('IP address missing', 'IP_MISSING');
    }

    await enforceLoginRateLimit({ identifier, ip });

    const authUser = await authenticateUser({
        identifier,
        password,
        ip,
    });

    logger.info(
        { userId: authUser.id, ip },
        'Login successful'
    );

    return createSessionAndTokens(authUser.id);
};

exports.register = async ({ email, password, username }) => {
    const exists = await userPort.existsByEmail(email);
    if (exists) {
        logger.warn({ email }, 'Register attempt with existing email');
        throw Conflict('Email already in use', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await transactionPort.runInTransaction(async (tx) => {
        const user = await userPort.createForAuth(
            {email, passwordHash, username},
            tx
        );

        const userProfile = await userProfilePort.createProfileForUser(
            {userId: user.id},
            tx
        );

        return user;
    })

    return {
        message: 'User registered successfully',
        userId: user.id,
    };
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

exports.sessions = async (userId) => {

    const user = await userPort.findPublicProfileById(userId);
    if (!user) {
        throw NotFound('User not found', 'USER_NOT_FOUND');
    }

    const sessions = await repo.findUserSessions(userId);

    const loginAttempts = await repo.findLoginAttempts({
        email: user.email,
        limit: 20,
    });

    return {
        sessions,
        loginAttempts,
    };
};