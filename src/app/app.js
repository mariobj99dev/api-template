
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
        ];

        // Permitir requests sin origin (Postman, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

const app = express()
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

routes(app);

app.use(errorMiddleware);

module.exports = app;