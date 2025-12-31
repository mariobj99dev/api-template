const db = require("../../../app/database");

let implementation = null;

const ensureImpl = () => {
    if (!implementation) throw new Error("IdentityPort implementation not set");
};

module.exports = {
    setImplementation: (impl) => { implementation = impl; },

    createSession: async (...args) => {
        ensureImpl();
        return implementation.createSession(...args);
    },

    findSessionById: async (...args) => {
        ensureImpl();
        return implementation.findSessionById(...args);
    },

    rotateSessionToken: async (...args) => {
        ensureImpl();
        return implementation.rotateSessionToken(...args);
    },

    revokeSession: async (...args) => {
        ensureImpl();
        return implementation.revokeSession(...args);
    },

    revokeAllUserSessions: async (...args) => {
        ensureImpl();
        return implementation.revokeAllUserSessions(...args);
    },

    findUserSessions: async (...args) => {
        ensureImpl();
        return implementation.findUserSessions(...args);
    }
}