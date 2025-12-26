const express = require('express');
const router = express.Router();
const controller = require('./auth.controller.js');
const authMiddleware = require('../../app/middlewares/auth.middleware');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, controller.me);

//TODO: /session

module.exports = router;
