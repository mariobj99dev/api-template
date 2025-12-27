
const express = require('express')
const cookieParser = require('cookie-parser');
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const app = express()
app.use(apiLimiter)
app.use(helmet())
app.use(express.json());
app.use(cookieParser());

routes(app);

app.use(errorMiddleware);

module.exports = app