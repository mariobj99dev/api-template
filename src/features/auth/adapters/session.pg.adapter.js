

const db = require('../../../app/database')

exports.createSession = async ({ userId, refreshTokenHash, expiresAt, sessionId = randomUUID() }, client = db) => {
    const result = await client.query(
        `INSERT INTO user_sessions
      (id, user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, expires_at, created_at`,
        [sessionId, userId, refreshTokenHash, expiresAt]
    );
    return result.rows[0];
};

exports.findSessionById = async (sessionId) => {
    const result = await db.query(
        'SELECT * FROM user_sessions WHERE id = $1',
        [sessionId]
    );
    return result.rows[0];
};

exports.rotateSessionToken = async ({ sessionId, newRefreshTokenHash }, client = db) => {
    const result = await client.query(
        `UPDATE user_sessions
     SET previous_refresh_token_hash = refresh_token_hash,
         refresh_token_hash = $2,
         last_used_at = NOW()
     WHERE id = $1
       AND revoked_at IS NULL
     RETURNING *`,
        [sessionId, newRefreshTokenHash]
    );
    return result.rows[0];
};

exports.revokeSession = async ({ sessionId, reason = 'logout' }, client = db) => {
    const result = await client.query(
        `UPDATE user_sessions
     SET revoked_at = NOW(), revoked_reason = $2
     WHERE id = $1 AND revoked_at IS NULL
     RETURNING *`,
        [sessionId, reason]
    );
    return result.rows[0];
};

exports.revokeAllUserSessions = async ({ userId, reason = 'security' }, client = db) => {
    await client.query(
        `UPDATE user_sessions
     SET revoked_at = NOW(), revoked_reason = $2
     WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId, reason]
    );
};

exports.findUserSessions = async (userId) => {
    const result = await db.query(
        `
        SELECT
            id,
            created_at,
            last_used_at,
            expires_at,
            revoked_at,
            revoked_reason
        FROM user_sessions
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

