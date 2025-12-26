
const { BadRequest } = require('../../../app/errors');

exports.RegisterDTO = ({ email, password, username }) => {
    if (!email || !password) {
        throw BadRequest('Invalid register payload', 'INVALID_REGISTER_PAYLOAD');
    }

    return {
        email,
        password,
        username,
    };
};