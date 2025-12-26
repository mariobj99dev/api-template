
const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../errors');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw Unauthorized('Authorization header missing', 'AUTH_HEADER_MISSING');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
        throw Unauthorized('Invalid authorization format', 'AUTH_FORMAT_INVALID');
    }

    try {
        const payload = jwt.verify(token, JWT_ACCESS_SECRET);

        // 👇 inyectamos solo lo necesario
        req.userId = payload.id;

        next();
    } catch {
        throw Unauthorized('Invalid or expired access token', 'ACCESS_TOKEN_INVALID');
    }
};
