
const db = require('../../../app/database');

exports.findForAuth = async (email) => {
    const result = await db.query(
        'SELECT id, password FROM users WHERE email = $1',
        [email]
    );

    if (!result.rows[0]) return null;

    return {
        id: result.rows[0].id,
        passwordHash: result.rows[0].password,
    };
};

exports.existsByEmail = async (email) => {
    const result = await db.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
    );
    return Boolean(result.rows.length);
};

exports.createForAuth = async ({ email, passwordHash, username }) => {
    const result = await db.query(
        `
        INSERT INTO users (email, password, username)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [email, passwordHash, username || email]
    );

    return { id: result.rows[0].id };
};

exports.findPublicProfileById = async (userId) => {
    const result = await db.query(
        `
        SELECT id, email, username, first_name, last_name, created_at
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    if (!result.rows[0]) return null;

    return result.rows[0];
};
