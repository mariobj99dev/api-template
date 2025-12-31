
const loginAttemptsPort = require('../ports/loginAttempts.port');

const logger = require('../../../app/config/logger');

const { TooManyRequests } = require('../../../app/errors');

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
        throw TooManyRequests(
            'Too many login attempts. Try again later.',
            'LOGIN_RATE_LIMIT'
        );
    }
};

module.exports = { enforceLoginRateLimit };
