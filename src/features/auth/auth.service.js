// features/auth/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userPort = require('../users/ports/user.port');
const userProfilePort = require('../profiles/ports/userProfile.port');
const transactionPort = require('./ports/transaction.port');
const identityPort = require('./ports/authIdentity.port');
const sessionPort = require('./ports/session.port');
const loginAttemptsPort = require('./ports/loginAttempts.port');

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

    await userPort.updateLastLogin(authUser.id);
    //TODO: Tener en cuenta que una vez inicia sesión actualiza la ultima sesión pero no la guarda aqui

    logger.info(
        { userId: authUser.id, ip },
        'Login successful'
    );

    return createSessionAndTokens(authUser.id);
};

exports.register = async ({ email, password, username }) => {
    if (email) {
        const existsEmail = await userPort.existsByEmail(email);
        if (existsEmail) throw Conflict('Email already in use', 'EMAIL_EXISTS');
    }

    if (username) {
        const existsUsername = await userPort.existsByUsername(username);
        if (existsUsername) throw Conflict('Username already in use', 'USERNAME_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await transactionPort.runInTransaction(async (tx) => {
        const user = await userPort.createForAuth(
            { email, passwordHash, username },
            tx
        );

        await userProfilePort.createProfileForUser({ userId: user.id }, tx);

        await identityPort.linkIdentity(
            {
                userId: user.id,
                provider: 'local',
                providerUserId: `local:${user.id}`,
            },
            tx
        );

        return user;
    });

    return { message: 'User registered successfully', userId: user.id };
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
            await sessionPort.revokeSession({ sessionId: payload.sid, reason: 'logout' });
        }
    } catch {
        // idempotente
    }

    return { message: 'Logged out' };
};

exports.me = async (userId) => {
    const user = await userProfilePort.findUserProfileByUserId(userId);

    if (!user) {
        throw NotFound('User not found', 'USER_NOT_FOUND');
    }

    return user;
};

exports.sessions = async (userId) => {

    const user = await userProfilePort.findUserProfileByUserId(userId);
    if (!user) {
        throw NotFound('User not found', 'USER_NOT_FOUND');
    }

    //TODO: Cambiar esto para encontrar bien las sesiones de un usuario
    const sessions = await sessionPort.findUserSessions(userId);

    const loginAttempts = await loginAttemptsPort.findLoginAttempts({
        identifier: user.nickname,
        limit: 20,
    });

    return {
        sessions,
        loginAttempts,
    };
};