
const {BadRequest} = require('../../../app/errors')

exports.LoginDTO = ({ identifier, password }) => {
    if (!identifier || !password) {
        throw BadRequest('Invalid login payload', 'INVALID_LOGIN_PAYLOAD');
    }

    return {
        identifier: identifier,
        password,
    };
};
