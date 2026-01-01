
const jwt = require('jsonwebtoken');

const makeLogoutUseCase = ({ sessionPort, JWT_REFRESH_SECRET }) => {
    return async ({ refreshToken }) => {
        if (!refreshToken) return { message: 'Logged out' };

        try {
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            if (payload?.sid) {
                await sessionPort.revokeSession({ sessionId: payload.sid, reason: 'logout' });
            }
        } catch {
            // idempotente
        }

        return { message: 'Logged out' };
    };
};

module.exports = { makeLogoutUseCase };
