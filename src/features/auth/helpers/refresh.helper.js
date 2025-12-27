// features/auth/helpers/refresh.helper.js

const repo = require('../auth.repository');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
    Unauthorized,
    NotFound,
} = require('../../../app/errors');

const {
    JWT_REFRESH_SECRET,
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    REFRESH_TOKEN_PEPPER,
} = require('../../../app/config/env');

const hashRefreshToken = (token) =>
    crypto
        .createHmac('sha256', REFRESH_TOKEN_PEPPER)
        .update(token)
        .digest('hex');

const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

const signRefreshToken = ({ sessionId, userId, expiresIn }) =>
    jwt.sign(
        { sid: sessionId, uid: userId, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn }
    );

const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
        throw Unauthorized('Invalid or expired refresh token', 'REFRESH_INVALID');
    }
};

const loadValidSession = async (payload) => {
    if (payload.type !== 'refresh' || !payload.sid || !payload.uid) {
        throw Unauthorized('Invalid refresh token payload', 'REFRESH_PAYLOAD');
    }

    const session = await repo.findSessionById(payload.sid);
    if (!session) throw NotFound('Session not found', 'SESSION_NOT_FOUND');

    if (session.revoked_at) {
        logger.warn(
            { sessionId: session.id },
            'Attempt to use revoked session'
        );
        throw Unauthorized('Session revoked', 'SESSION_REVOKED');
    }

    if (new Date(session.expires_at) <= new Date()) {
        await repo.revokeSession({ sessionId: session.id, reason: 'expired' });
        throw Unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    return session;
};

const rotateTokens = async ({ session, refreshToken }) => {
    const incomingHash = hashRefreshToken(refreshToken);

    // ✅ token actual
    if (incomingHash === session.refresh_token_hash) {
        const accessToken = signAccessToken(session.user_id);

        const remainingMs =
            new Date(session.expires_at).getTime() - Date.now();
        const remainingSeconds = Math.floor(remainingMs / 1000);

        if (remainingSeconds <= 0) {
            await repo.revokeSession({ sessionId: session.id, reason: 'expired' });
            throw Unauthorized('Session expired', 'SESSION_EXPIRED');
        }

        const newRefreshToken = signRefreshToken({
            sessionId: session.id,
            userId: session.user_id,
            expiresIn: remainingSeconds,
        });

        await repo.rotateSessionToken({
            sessionId: session.id,
            newRefreshTokenHash: hashRefreshToken(newRefreshToken),
        });

        return { accessToken, refreshToken: newRefreshToken };
    }

    // 🚨 reuse detectado
    if (
        session.previous_refresh_token_hash &&
        incomingHash === session.previous_refresh_token_hash
    ) {
        await repo.revokeAllUserSessions({
            userId: session.user_id,
            reason: 'refresh_reuse_detected',
        });
        logger.error(
            { userId: session.user_id, sessionId: session.id },
            'Refresh token reuse detected'
        );
        throw Unauthorized('Refresh token reuse detected', 'REFRESH_INVALID');
    }

    await repo.revokeSession({
        sessionId: session.id,
        reason: 'invalid_refresh',
    });

    throw Unauthorized('Invalid refresh token', 'REFRESH_INVALID');
};

module.exports = {
    verifyRefreshToken,
    loadValidSession,
    rotateTokens,
};
