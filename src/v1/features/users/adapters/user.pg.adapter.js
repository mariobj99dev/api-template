
const db = require('../../../app/database');

const looksLikeEmail = (value) => typeof value === 'string' && value.includes('@');

exports.findForAuth = async (identifier) => {
    const sql = looksLikeEmail(identifier)
        ? 'SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER($1)'
        : 'SELECT id, password_hash FROM users WHERE LOWER(username) = LOWER($1)';

    const result = await db.query(sql, [identifier]);
    if (!result.rows[0]) return null;

    return {
        id: result.rows[0].id,
        passwordHash: result.rows[0].password_hash,
    };
};

//TODO: Adaptar esto para que no hayan dos metodos, uno para saber que existe y otro que te devuelva ya que si devuelve es que ya existe
exports.findIdByEmail = async (email) => {
    const result = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0]?.id || null;
};

exports.findIdByUsername = async (username) => {
    const result = await db.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
    );
    return result.rows[0]?.id || null;
};

exports.existsByEmail = async (email) => {
    const result = await db.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
    );
    return Boolean(result.rows.length);
};

exports.existsByUsername = async (username) => {
    const result = await db.query(
        'SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
    );
    return Boolean(result.rows.length);
};

exports.createForAuth = async ({ email, passwordHash, username }, client = db) => {
    const result = await client.query(
        `
        INSERT INTO users (email, password_hash, username)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [email, passwordHash, username || email]
    );

    return { id: result.rows[0].id };
};

exports.updateLastLogin = async (userId, client = db) => {
    const result = await client.query(
        `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
        [userId]
    )
};
