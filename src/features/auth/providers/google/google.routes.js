
const express = require('express');
const router = express.Router();

const controller = require('./google.controller');
const postmanController = require('./google.postman.controller');

router.get('/google', controller.start);
router.get('/google/callback', controller.callback);

// ⬇️ SOLO PARA POSTMAN
router.post('/google/postman', postmanController.postmanLogin);

module.exports = router;
