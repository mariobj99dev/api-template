
const requiredEnvVars = {
    API_PORT: 'number',

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

};

const validateEnv = () => {
    const errors = [];

    for (const [key, type] of Object.entries(requiredEnvVars)) {
        const value = process.env[key];

        if (value === undefined) {
            errors.push(`Missing environment variable: ${key}`);
            continue;
        }

        if (type === 'number' && Number.isNaN(Number(value))) {
            errors.push(`Environment variable ${key} must be a number`);
        }
    }

    if (errors.length > 0) {
        console.error('Environment validation failed:\n');
        errors.forEach(err => console.error(err));
        process.exit(1); // ⬅️ MATA la app
    }
};

module.exports = validateEnv;
