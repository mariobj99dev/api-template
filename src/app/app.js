

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const cors = require('cors');
const YAML = require('yaml')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');

const errorMiddleware = require('./middlewares/error.middleware');
const httpLogger = require('./middlewares/logger.middleware')

const openapiPath = path.join(__dirname, 'docs', 'openapi.yaml');
const openapiFile = fs.readFileSync(openapiPath, 'utf8');
const openapiDocument = YAML.parse(openapiFile);

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
app.use(httpLogger)
routes(app);

app.use(errorMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


module.exports = app;