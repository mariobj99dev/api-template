
const { BadRequest } = require('../../../app/errors');

const makeRefreshUseCase = ({ verifyRefreshToken, loadValidSession, rotateTokens }) => {
    return async ({ refreshToken }) => {
        if (!refreshToken) throw BadRequest('Refresh token missing', 'REFRESH_MISSING');

        const payload = verifyRefreshToken(refreshToken);
        const session = await loadValidSession(payload);

        return rotateTokens({ session, refreshToken });
    };
};

module.exports = { makeRefreshUseCase };
