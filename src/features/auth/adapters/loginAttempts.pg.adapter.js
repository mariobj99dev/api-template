const db = require("../../../app/database");

exports.countFailedLoginAttempts = async ({ identifier, ip, minutes }) => {
    const result = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM login_attempts
        WHERE identifier = $1
          AND ip_address = $2
          AND success = false
          AND created_at > NOW() - INTERVAL '${minutes} minutes'
        `,
        [identifier, ip]
    );

    return result.rows[0].count;
};

exports.logLoginAttempt = async ({ identifier, ip, success }, client = db) => {
    await client.query(
        `
        INSERT INTO login_attempts (identifier, ip_address, success)
        VALUES ($1, $2, $3)
        `,
        [identifier, ip, success]
    );
};

exports.findLoginAttempts = async ({ identifier, limit = 20 }) => {
    const result = await db.query(
        `
        SELECT
            ip_address,
            success,
            created_at
        FROM login_attempts
        WHERE identifier = $1
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [identifier, limit]
    );

    return result.rows;
};