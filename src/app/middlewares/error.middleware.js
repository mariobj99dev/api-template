
const { AppError } = require('../errors');

module.exports = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
    }

    console.error(err);

    return res.status(500).json({
        error: 'Internal server error',
    });
};
