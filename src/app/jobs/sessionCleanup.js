const cron = require('node-cron');
const db = require('../database');

const { SESSION_LOGOUT_RETENTION_DAYS } = require('../../app/config/env');

const LOGOUT_RETENTION_DAYS = Number(
    SESSION_LOGOUT_RETENTION_DAYS
);

// Corre cada día a las 03:00
cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Cleaning user sessions...');

    // 1️⃣ Borrar sesiones expiradas
    await db.query(`
    DELETE FROM user_sessions
    WHERE expires_at < NOW()
  `);

    // 2️⃣ Borrar sesiones logout antiguas
    await db.query(`
    DELETE FROM user_sessions
    WHERE revoked_at IS NOT NULL
      AND revoked_reason = 'logout'
      AND revoked_at < NOW() - INTERVAL '${LOGOUT_RETENTION_DAYS} days'
  `);

    console.log('[CRON] Session cleanup completed');
});
