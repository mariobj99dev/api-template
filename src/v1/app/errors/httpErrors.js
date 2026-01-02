
const AppError = require('./AppError');

// 4xx – Client errors
const BadRequest = (msg = 'Bad request', code) =>
    new AppError(msg, 400, code);

const Unauthorized = (msg = 'Unauthorized', code) =>
    new AppError(msg, 401, code);

const Forbidden = (msg = 'Forbidden', code) =>
    new AppError(msg, 403, code);

const NotFound = (msg = 'Not found', code) =>
    new AppError(msg, 404, code);

const Conflict = (msg = 'Conflict', code) =>
    new AppError(msg, 409, code);

const UnprocessableEntity = (msg = 'Unprocessable entity', code) =>
    new AppError(msg, 422, code);

const TooManyRequests = (msg = 'Too many requests', code) =>
    new AppError(msg, 429, code);

// 5xx – Server errors
const InternalServerError = (msg = 'Internal server error', code) =>
    new AppError(msg, 500, code);

const ServiceUnavailable = (msg = 'Service unavailable', code) =>
    new AppError(msg, 503, code);

module.exports = {
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
    TooManyRequests,
    InternalServerError,
    ServiceUnavailable,
};
