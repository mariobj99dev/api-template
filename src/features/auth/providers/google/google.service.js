const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const userPort = require('../../../users/ports/user.port');
const userProfilePort = require('../../../profiles/ports/userProfile.port');
const identityPort = require('../../ports/authIdentity.port');
const transactionPort = require('../../ports/transaction.port');

const { createSessionAndTokens } = require('../../helpers/sessionTokens.helper');
//const { createSessionAndTokens } = require('../../helpers/login.helper');

const {
    AUTH_PROVIDERS,
    SALT_ROUNDS,
} = require('../../../../app/config/env');

const { BadRequest, Unauthorized } = require('../../../../app/errors');

const provider = AUTH_PROVIDERS.google;

const getClient = () =>
    new OAuth2Client(
        provider.clientId,
        provider.clientSecret,
        provider.callbackUrl
    );

exports.getAuthUrl = () => {
    if (!provider.enabled) {
        throw BadRequest('Google auth disabled', 'GOOGLE_DISABLED');
    }

    const state = crypto.randomUUID();
    const client = getClient();

    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', 'profile'],
        state,
    });

    return { url, state };
};

exports.handleCallback = async ({ code, state, stateCookie }) => {
    if (!provider.enabled) {
        throw BadRequest('Google auth disabled', 'GOOGLE_DISABLED');
    }

    if (!code) {
        throw BadRequest('Missing code', 'GOOGLE_CODE_MISSING');
    }

    if (!state || !stateCookie || state !== stateCookie) {
        throw Unauthorized('Invalid oauth state', 'OAUTH_STATE_INVALID');
    }

    const client = getClient();

    const { tokens } = await client.getToken(String(code));
    if (!tokens?.id_token) {
        throw Unauthorized('Missing id_token', 'GOOGLE_ID_TOKEN_MISSING');
    }

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: provider.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
        throw Unauthorized('Invalid Google profile', 'GOOGLE_PROFILE_INVALID');
    }

    const {
        email,
        sub: googleId,
        name,
        picture,
        given_name: givenName,
        family_name: familyName,
    } = payload;

    const userIdByIdentity = await identityPort.findUserIdByProvider({
        provider: 'google',
        providerUserId: googleId,
    });

    if (userIdByIdentity) {
        return createSessionAndTokens(userIdByIdentity);
    }

    const userIdByEmail = await userPort.findIdByEmail(email);

    if (userIdByEmail) {
        await identityPort.linkIdentity({
            userId: userIdByEmail,
            provider: 'google',
            providerUserId: googleId,
        });

        return createSessionAndTokens(userIdByEmail);
    }

    const userId = await transactionPort.runInTransaction(async (tx) => {
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

        const user = await userPort.createForAuth(
            { email, passwordHash },
            tx
        );

        await userProfilePort.createProfileForUser(
            {
                userId: user.id,
                displayName: name,
                firstName: givenName,
                lastName: familyName,
                avatarUrl: picture,
            },
            tx
        );

        await identityPort.linkIdentity(
            {
                userId: user.id,
                provider: 'google',
                providerUserId: googleId,
            },
            tx
        );

        return user.id;
    });

    return createSessionAndTokens(userId);
};

