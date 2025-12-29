const requiredEnvVars = {
    API_PORT: 'number',
    NODE_ENV: 'string',

    COOKIE_HTTP_ONLY: 'boolean',
    COOKIE_SECURE: 'boolean',
    COOKIE_SAMESITE: 'string',
    COOKIE_PATH: 'string',

    DATABASE_HOST: 'string',
    DATABASE_USER: 'string',
    DATABASE_PASSWORD: 'string',
    DATABASE_DATABASE: 'string',
    DATABASE_PORT: 'number',

    SALT_ROUNDS: 'number',

    JWT_ACCESS_SECRET: 'string',
    JWT_ACCESS_EXPIRES_IN: 'string',

    JWT_REFRESH_SECRET: 'string',
    JWT_REFRESH_EXPIRES_IN: 'string',

    REFRESH_TOKEN_PEPPER: 'string',

    MAX_LOGIN_ATTEMPTS: 'number',
    LOGIN_ATTEMPT_WINDOW_MINUTES: 'number',

    SESSION_LOGOUT_RETENTION_DAYS: 'number',
    GOOGLE_AUTH_ENABLED: 'boolean',
};

const parseBoolean = (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
};

const validateAndLoadEnv = () => {
    const errors = [];
    const env = {};

    if (process.env.GOOGLE_AUTH_ENABLED === 'true') {
        const providerRequired = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_CALLBACK_URL',
        ];

        for (const k of providerRequired) {
            if (!process.env[k]) {
                errors.push(`Missing environment variable: ${k} (required when GOOGLE_AUTH_ENABLED=true)`);
            }
        }
    }

    for (const [key, type] of Object.entries(requiredEnvVars)) {

        const rawValue = process.env[key];

        if (rawValue === undefined) {
            errors.push(`Missing environment variable: ${key}`);
            continue;
        }

        switch (type) {
            case 'number': {
                const num = Number(rawValue);
                if (Number.isNaN(num)) {
                    errors.push(`Environment variable ${key} must be a number`);
                } else {
                    env[key] = num;
                }
                break;
            }

            case 'boolean': {
                const bool = parseBoolean(rawValue);
                if (bool === null) {
                    errors.push(`Environment variable ${key} must be 'true' or 'false'`);
                } else {
                    env[key] = bool;
                }
                break;
            }

            case 'string':
                env[key] = rawValue;
                break;

            default:
                errors.push(`Unknown type for env var ${key}`);
        }
    }

    if (errors.length > 0) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Environment validation failed:\n');
            errors.forEach(err => console.error(`❌ ${err}`));
            process.exit(1); // 🔥 FAIL FAST en prod/dev
        }

        // En test: no matar el proceso
        return {};
    }

    env.AUTH_PROVIDERS = {
        google: {
            enabled: env.GOOGLE_AUTH_ENABLED,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        }
    };

    return env;
};

module.exports = validateAndLoadEnv();
