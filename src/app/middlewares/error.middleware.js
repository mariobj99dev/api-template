
const { AppError } = require('../errors');
const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
    }

    logger.error(
        {
            err,
            method: req.method,
            path: req.originalUrl,
        },
        'Unhandled error'
    );

    return res.status(500).json({
        error: 'Internal server error',
    });
};
