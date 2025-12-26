
const {BadRequest} = require('../../../app/errors')

exports.LoginDTO = ({ email, password }) => {
    if (!email || !password) {
        throw BadRequest('Invalid login payload', 'INVALID_LOGIN_PAYLOAD');
    }

    return {
        identifier: email,
        password,
    };
};
