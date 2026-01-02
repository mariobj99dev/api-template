
let implementation = {
    // 👇 fallback seguro (NullAdapter)
    runInTransaction: async (fn) => fn(),
};

module.exports = {
    setImplementation: (impl) => {
        implementation = impl;
    },

    runInTransaction: async (...args) => {
        return implementation.runInTransaction(...args);
    },
};

/*
let implementation = null;

const ensureImpl = () => {
    if (!implementation) {
        throw new Error("TransactionPort implementation not set")
    }
}*/

/*
module.exports = {
    setImplementation: (impl) => {
        implementation = impl;
    },
    runInTransaction: async (fn) => fn(),
}*/


/*
module.exports = {
    setImplementation: (impl) => {
        implementation = impl;
    },

    runInTransaction: async (...args) => {
        ensureImpl();
        return implementation.runInTransaction(...args);
    },
};*/