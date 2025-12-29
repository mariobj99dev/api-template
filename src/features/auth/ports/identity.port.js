let implementation = null;

const ensureImpl = () => {
    if (!implementation) throw new Error("IdentityPort implementation not set");
};

module.exports = {
    setImplementation: (impl) => { implementation = impl; },

    findUserIdByProvider: async (...args) => {
        ensureImpl();
        return implementation.findUserIdByProvider(...args);
    },

    linkIdentity: async (...args) => {
        ensureImpl();
        return implementation.linkIdentity(...args);
    },
};
