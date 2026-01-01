
const userPort = require('../users/ports/user.port');
const userProfilePort = require('../profiles/ports/userProfile.port');
const transactionPort = require('./ports/transaction.port');
const identityPort = require('./ports/authIdentity.port');
const sessionPort = require('./ports/session.port');
const loginAttemptsPort = require('./ports/loginAttempts.port');

const logger = require('../../app/config/logger');

const { SALT_ROUNDS, JWT_REFRESH_SECRET } = require('../../app/config/env');

const {
    enforceLoginRateLimit,
    authenticateUser,
    createSessionAndTokens,
} = require('./helpers/login.helper'); // tu helper actual :contentReference[oaicite:2]{index=2}

const {
    verifyRefreshToken,
    loadValidSession,
    rotateTokens,
} = require('./helpers/refresh.helper'); // tu helper actual :contentReference[oaicite:3]{index=3}

const {
    makeLoginUseCase,
    makeRegisterUseCase,
    makeRefreshUseCase,
    makeLogoutUseCase,
    makeMeUseCase,
    makeSessionsUseCase,
} = require('./useCases');

module.exports = {
    login: makeLoginUseCase({
        userPort,
        logger,
        enforceLoginRateLimit,
        authenticateUser,
        createSessionAndTokens,
    }),

    register: makeRegisterUseCase({
        userPort,
        userProfilePort,
        identityPort,
        transactionPort,
        SALT_ROUNDS,
    }),

    refresh: makeRefreshUseCase({
        verifyRefreshToken,
        loadValidSession,
        rotateTokens,
    }),

    logout: makeLogoutUseCase({
        sessionPort,
        JWT_REFRESH_SECRET,
    }),

    me: makeMeUseCase({ userProfilePort }),

    sessions: makeSessionsUseCase({
        userProfilePort,
        sessionPort,
        loginAttemptsPort,
    }),
};
