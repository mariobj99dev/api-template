
let implementation = null;

const ensureImpl = () => {
    if (!implementation) {
        throw new Error("UserPort implementation not set")
    }
}

module.exports = {
    setImplementation: (impl) => {
        implementation = impl;
    },

    findForAuth: async (...args) => {
        ensureImpl();
        return implementation.findForAuth(...args);
    },

    createForAuth: async (...args) => {
        ensureImpl();
        return implementation.createForAuth(...args);
    },

    existsByEmail: async (...args) => {
        ensureImpl();
        return implementation.existsByEmail(...args);
    },

    findPublicProfileById: async (...args) => {
        ensureImpl();
        return implementation.findPublicProfileById(...args);
    },
};