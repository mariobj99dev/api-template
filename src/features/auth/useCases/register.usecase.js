
const bcrypt = require('bcrypt');
const { Conflict } = require('../../../app/errors');

const makeRegisterUseCase = ({
                                 userPort,
                                 userProfilePort,
                                 identityPort,
                                 transactionPort,
                                 SALT_ROUNDS,
                             }) => {
    return async ({ email, password, username }) => {
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
};

module.exports = { makeRegisterUseCase };
