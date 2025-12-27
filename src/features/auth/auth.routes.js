const express = require('express');
const router = express.Router();
const controller = require('./auth.controller.js');

const authMiddleware = require('../../app/middlewares/auth.middleware');
const { validate } = require('../../app/middlewares/validate.middleware');

const {
    loginSchema,
    registerSchema
} = require('./auth.schema');

const userPort = require('../auth/ports/user.port');
const userPgAdapter = require('../auth/adapters/user.pg.adapter');

userPort.setImplementation(userPgAdapter);

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
