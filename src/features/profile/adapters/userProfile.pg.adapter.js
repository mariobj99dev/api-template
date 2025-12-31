
const db = require('../../../app/database');

exports.createProfileForUser = async ({
    userId,
    displayName = null,
    firstName = null,
    lastName = null,
    avatarUrl = null,
    bio = null,
}, client = db) => {
    const result = await client.query(`
    INSERT INTO user_profiles (
        user_id,
        display_name,
        first_name,
        last_name,
        avatar_url,
        bio
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING user_id`,
        [userId, displayName, firstName, lastName, avatarUrl, bio]
    );

    return { userId: result.rows[0].user_id };
};

exports.updateUserProfile = async (changeme) => {

};

exports.findUserProfileByUserId = async (userId) => {
    const result = await db.query(
        `
            SELECT
                u.id,
                u.email,
                u.username,
                u.status,
                u.created_at,
                p.display_name,
                p.first_name,
                p.last_name,
                p.avatar_url,
                p.bio
            FROM users u
                     LEFT JOIN user_profiles p ON p.user_id = u.id
            WHERE u.id = $1
        `,
        [userId]
    );

    return result.rows[0] || null;
};

exports.updateProfileAvatar = async (changeme) => {

};

exports.updateProfileBio = async (changeme) => {

};

exports.profileExistsForUser = async (changeme) => {

};