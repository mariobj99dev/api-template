
const { BadRequest } = require('../../../app/errors');

const makeLoginUseCase = ({
    userPort,
    logger,
    enforceLoginRateLimit,
    authenticateUser,
    createSessionAndTokens,
}) => {
    return async ({ identifier, password }, { ip } = {}) => {
        if (!ip) {
            logger.warn({ identifier }, 'Login attempt without IP');
            throw BadRequest('IP address missing', 'IP_MISSING');
        }

        await enforceLoginRateLimit({ identifier, ip });

        const authUser = await authenticateUser({ identifier, password, ip });

        await userPort.updateLastLogin(authUser.id);

        logger.info({ userId: authUser.id, ip }, 'Login successful');

        return createSessionAndTokens(authUser.id);
    };
};

module.exports = { makeLoginUseCase };
