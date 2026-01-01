
const { NotFound } = require('../../../app/errors');

const makeMeUseCase = ({ userProfilePort }) => {
    return async (userId) => {
        const user = await userProfilePort.findUserProfileByUserId(userId);
        if (!user) throw NotFound('User not found', 'USER_NOT_FOUND');
        return user;
    };
};

module.exports = { makeMeUseCase };
