const db = require('../../../app/database');
const crypto = require('crypto');

exports.findUserIdByProvider = async ({ provider, providerUserId }) => {
    const result = await db.query(
        `SELECT user_id
         FROM auth_identities
         WHERE provider = $1 AND provider_user_id = $2`,
        [provider, providerUserId]
    );

    return result.rows[0]?.user_id || null;
};

exports.linkIdentity = async ({ userId, provider, providerUserId }) => {
    const id = crypto.randomUUID();

    await db.query(
        `INSERT INTO auth_identities (id, user_id, provider, provider_user_id)
         VALUES ($1, $2, $3, $4)
             ON CONFLICT (provider, provider_user_id) DO NOTHING`,
        [id, userId, provider, providerUserId]
    );

    return { id, userId, provider, providerUserId };
};
