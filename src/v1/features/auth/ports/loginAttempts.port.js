
const db = require('../../../app/database')

let implementation = null;

const ensureImpl = () => {
    if (!implementation) throw new Error("IdentityPort implementation not set");
};

module.exports = {
    setImplementation: (impl) => { implementation = impl; },

    countFailedLoginAttempts: async (...args) => {
        ensureImpl();
        return implementation.countFailedLoginAttempts(...args);
    },

    logLoginAttempt: async (...args) => {
        ensureImpl();
        return implementation.logLoginAttempt(...args);
    },

    findLoginAttempts: async (...args) => {
        ensureImpl();
        return implementation.findLoginAttempts(...args);
    }
}