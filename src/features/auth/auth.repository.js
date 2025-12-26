
const db = require('../../app/database')

// ----------------------------
// Sessions (Refresh tokens)
// ----------------------------

exports.createSession = async ({ userId, refreshTokenHash, expiresAt, sessionId = randomUUID() }) => {
    const result = await db.query(
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

exports.rotateSessionToken = async ({ sessionId, newRefreshTokenHash }) => {
    const result = await db.query(
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

exports.revokeSession = async ({ sessionId, reason = 'logout' }) => {
    const result = await db.query(
        `UPDATE user_sessions
     SET revoked_at = NOW(), revoked_reason = $2
     WHERE id = $1 AND revoked_at IS NULL
     RETURNING *`,
        [sessionId, reason]
    );
    return result.rows[0];
};

exports.revokeAllUserSessions = async ({ userId, reason = 'security' }) => {
    await db.query(
        `UPDATE user_sessions
     SET revoked_at = NOW(), revoked_reason = $2
     WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId, reason]
    );
};

// ----------------------------
// Login attempts (IP + user)
// ----------------------------

exports.countFailedLoginAttempts = async ({ email, ip, minutes }) => {
    const result = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM login_attempts
        WHERE email = $1
          AND ip_address = $2
          AND success = false
          AND created_at > NOW() - INTERVAL '${minutes} minutes'
        `,
        [email, ip]
    );

    return result.rows[0].count;
};

exports.logLoginAttempt = async ({ email, ip, success }) => {
    await db.query(
        `
        INSERT INTO login_attempts (email, ip_address, success)
        VALUES ($1, $2, $3)
        `,
        [email, ip, success]
    );
};
