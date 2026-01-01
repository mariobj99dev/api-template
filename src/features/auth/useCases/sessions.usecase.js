
const { NotFound } = require('../../../app/errors');

const makeSessionsUseCase = ({ userProfilePort, sessionPort, loginAttemptsPort }) => {
    return async (userId) => {
        const user = await userProfilePort.findUserProfileByUserId(userId);
        if (!user) throw NotFound('User not found', 'USER_NOT_FOUND');

        const sessions = await sessionPort.findUserSessions(userId);

        // ⚠️ OJO: aquí tú usas user.nickname en tu service actual :contentReference[oaicite:0]{index=0}
        // Asegúrate de que realmente exista "nickname". Si es username/email, cámbialo.
        const identifier = user.nickname || user.username || user.email || String(userId);

        const loginAttempts = await loginAttemptsPort.findLoginAttempts({
            identifier,
            limit: 20,
        });

        return { sessions, loginAttempts };
    };
};

module.exports = { makeSessionsUseCase };
