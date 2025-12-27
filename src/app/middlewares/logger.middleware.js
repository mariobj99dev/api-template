
const pinoHttp = require('pino-http');
const logger = require('../config/logger');

module.exports = pinoHttp({
    logger,
    customLogLevel: (res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
});
