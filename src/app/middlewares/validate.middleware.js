const Joi = require('joi');
const { BadRequest } = require('../errors/httpErrors');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details
                .map(detail => detail.message)
                .join(', ');

            return next(BadRequest(message, 'VALIDATION_ERROR'));
        }

        req[property] = value;
        next();
    };
};

module.exports = { validate };
