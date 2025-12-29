
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

//TODO: Adaptar esto para que no hayan dos metodos, uno para saber que existe y otro que te devuelva ya que si devuelve es que ya existe
exports.findIdByEmail = async (email) => {
    const result = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
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
