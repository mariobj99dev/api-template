
const express = require('express')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')
const cookieParser = require('cookie-parser');

const app = express()
app.use(express.json());
app.use(cookieParser());

routes(app);

app.use(errorMiddleware);

module.exports = app