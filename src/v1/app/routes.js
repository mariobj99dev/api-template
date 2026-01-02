
const authRoutes = require('../features/auth/auth.routes');

module.exports = (app) => {
    app.use('/auth', authRoutes);
};