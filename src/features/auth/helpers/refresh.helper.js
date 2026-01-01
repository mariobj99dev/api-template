
const sessionPort = require('../ports/session.port');
const logger = require('../../../app/config/logger');

const {
    hashRefreshToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('./tokens.helper');

const { Unauthorized, NotFound } = require('../../../app/errors');

const loadValidSession = async (payload) => {
    if (payload.type !== 'refresh') {
        throw Unauthorized('Invalid refresh payload', 'REFRESH_PAYLOAD');
    }

    const session = await sessionPort.findSessionById(payload.sid);
    if (!session) throw NotFound('Session not found', 'SESSION_NOT_FOUND');

    if (session.revoked_at) {
        throw Unauthorized('Session revoked', 'SESSION_REVOKED');
    }

    if (new Date(session.expires_at) <= new Date()) {
        await sessionPort.revokeSession({ sessionId: session.id, reason: 'expired' });
        throw Unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    return session;
};

const rotateTokens = async ({ session, refreshToken }) => {
    const incomingHash = hashRefreshToken(refreshToken);

    if (incomingHash === session.refresh_token_hash) {
        const accessToken = signAccessToken(session.user_id);

        const remainingSeconds =
            Math.floor((new Date(session.expires_at) - Date.now()) / 1000);

        const newRefreshToken = signRefreshToken({
            sessionId: session.id,
            userId: session.user_id,
            expiresIn: remainingSeconds,
        });

        await sessionPort.rotateSessionToken({
            sessionId: session.id,
            newRefreshTokenHash: hashRefreshToken(newRefreshToken),
        });

        return { accessToken, refreshToken: newRefreshToken };
    }

    // reuse detected
    if (incomingHash === session.previous_refresh_token_hash) {
        await sessionPort.revokeAllUserSessions({
            userId: session.user_id,
            reason: 'refresh_reuse_detected',
        });

        logger.error({ userId: session.user_id }, 'Refresh token reuse detected');
    }

    await sessionPort.revokeSession({ sessionId: session.id, reason: 'invalid_refresh' });
    throw Unauthorized('Invalid refresh token', 'REFRESH_INVALID');
};

module.exports = {
    verifyRefreshToken,
    loadValidSession,
    rotateTokens,
};
