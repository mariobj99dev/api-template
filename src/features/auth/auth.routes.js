const express = require('express');
const router = express.Router();
const controller = require('./auth.controller.js');

const authMiddleware = require('../../app/middlewares/auth.middleware');
const { validate } = require('../../app/middlewares/validate.middleware');

const { AUTH_PROVIDERS } = require('../../app/config/env');

const {
    loginSchema,
    registerSchema
} = require('./auth.schema');

if (AUTH_PROVIDERS?.google?.enabled) {
    const googleRoutes = require('./providers/google/google.routes');
    router.use('/', googleRoutes); // => /auth/google y /auth/google/callback
}

router.post(
    '/login',
    validate(loginSchema),
    controller.login);
router.post(
    '/register',
    validate(registerSchema),
    controller.register);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, controller.me);
router.get('/sessions', authMiddleware, controller.sessions);

module.exports = router;
