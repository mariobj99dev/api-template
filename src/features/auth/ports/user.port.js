
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

    findIdByEmail: async (...args) => {
        ensureImpl();
        return implementation.findIdByEmail(...args);
    },

    findIdByUsername: async (...args) => {
        ensureImpl();
        return implementation.findIdByUsername(...args);
    },

    createForAuth: async (...args) => {
        ensureImpl();
        return implementation.createForAuth(...args);
    },

    existsByEmail: async (...args) => {
        ensureImpl();
        return implementation.existsByEmail(...args);
    },

    existsByUsername: async (...args) => {
        ensureImpl();
        return implementation.existsByUsername(...args);
    },

    updateLastLogin: async (...args) => {
        ensureImpl();
        return implementation.updateLastLogin(...args);
    }
};