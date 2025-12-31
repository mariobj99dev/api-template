
const { BadRequest } = require('../../../app/errors');

exports.RegisterDTO = ({ email, username, password }) => {
    if ((!email && !username) || !password) {
        throw BadRequest('Invalid register payload', 'INVALID_REGISTER_PAYLOAD');
    }
    return { email: email ?? null, username: username ?? null, password };
};