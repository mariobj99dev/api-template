
const { Pool } = require('pg');
const {
    DATABASE_HOST,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_DATABASE,
    DATABASE_PORT
} = require('../app/config/env');

const pool = new Pool({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_DATABASE,
    port: DATABASE_PORT,
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}