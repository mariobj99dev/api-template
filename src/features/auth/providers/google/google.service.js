const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const userPort = require('../../ports/user.port');
const identityPort = require('../../ports/identity.port');

const { createSessionAndTokens } = require('../../helpers/login.helper');

const {
    AUTH_PROVIDERS,
    SALT_ROUNDS,
} = require('../../../../app/config/env');

const { BadRequest, Unauthorized } = require('../../../../app/errors');

const provider = AUTH_PROVIDERS.google;

const getClient = () => new OAuth2Client(
    provider.clientId,
    provider.clientSecret,
    provider.callbackUrl
);

exports.getAuthUrl = () => {
    if (!provider.enabled) throw BadRequest('Google auth disabled', 'GOOGLE_DISABLED');

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
    if (!provider.enabled) throw BadRequest('Google auth disabled', 'GOOGLE_DISABLED');
    if (!code) throw BadRequest('Missing code', 'GOOGLE_CODE_MISSING');
    if (!state || !stateCookie || state !== stateCookie) {
        throw Unauthorized('Invalid oauth state', 'OAUTH_STATE_INVALID');
    }

    const client = getClient();

    const { tokens } = await client.getToken(String(code));
    if (!tokens?.id_token) throw Unauthorized('Missing id_token', 'GOOGLE_ID_TOKEN_MISSING');

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: provider.clientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const googleId = payload?.sub;
    const name = `user_${crypto.randomUUID().slice(0, 8)}`;
    /*const name = payload?.name || email;*/

    if (!email || !googleId) throw Unauthorized('Invalid Google profile', 'GOOGLE_PROFILE_INVALID');

    // 1) ¿Existe identidad google ya linkada?
    let userId = await identityPort.findUserIdByProvider({
        provider: 'google',
        providerUserId: googleId,
    });

    // 2) Si no, ¿existe usuario por email? -> link
    if (!userId) {
        const existingUserId = await userPort.findIdByEmail(email);

        if (existingUserId) {
            userId = existingUserId;
            await identityPort.linkIdentity({
                userId,
                provider: 'google',
                providerUserId: googleId,
            });
        } else {
            // 3) Crear usuario nuevo con password aleatoria hasheada
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

            const user = await userPort.createForAuth({
                email,
                passwordHash,
                username: name,
            });

            userId = user.id;

            await identityPort.linkIdentity({
                userId,
                provider: 'google',
                providerUserId: googleId,
            });
        }
    }

    // Emitimos tokens del sistema actual (misma mecánica que login)
    return createSessionAndTokens(userId);
};

exports.handleGoogleTokenForPostman = async (googleIdToken) => {
    const client = new OAuth2Client(provider.clientId);

    const ticket = await client.verifyIdToken({
        idToken: googleIdToken,
        audience: provider.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
        throw Unauthorized('Invalid Google token', 'GOOGLE_TOKEN_INVALID');
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || email;

    // === MISMA LÓGICA QUE YA TENÍAS ===
    let userId = await identityPort.findUserIdByProvider({
        provider: 'google',
        providerUserId: googleId,
    });

    if (!userId) {
        const existingUserId = await userPort.findIdByEmail(email);

        if (existingUserId) {
            userId = existingUserId;
            await identityPort.linkIdentity({
                userId,
                provider: 'google',
                providerUserId: googleId,
            });
        } else {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

            const user = await userPort.createForAuth({
                email,
                passwordHash,
                username: name,
            });

            userId = user.id;

            await identityPort.linkIdentity({
                userId,
                provider: 'google',
                providerUserId: googleId,
            });
        }
    }

    return createSessionAndTokens(userId);
};
