const Joi = require('joi');

const loginSchema = Joi.object({
    identifier: Joi.string().min(2).required(),
    password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().min(2).optional(),
    password: Joi.string().min(6).required(),
}).or('email', 'username');

module.exports = {
    loginSchema,
    registerSchema
};
