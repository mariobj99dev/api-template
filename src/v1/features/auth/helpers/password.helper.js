
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../../../app/config/env');

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashPassword, verifyPassword };
