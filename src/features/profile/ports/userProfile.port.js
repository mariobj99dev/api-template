
let implementation = null;

const ensureImpl = () => {
    if (!implementation) {
        throw new Error("UserProfilePort implementation not set")
    }
}

module.exports = {
    setImplementation: (impl) => {
        implementation = impl;
    },

    createProfileForUser: async (...args) => {
        ensureImpl();
        return implementation.createProfileForUser(...args);
    },

    updateUserProfile: async (...args) => {
        ensureImpl();
        return implementation.updateUserProfile(...args);
    },

    findUserProfileByUserId: async (...args) => {
        ensureImpl();
        return implementation.findUserProfileByUserId(...args);
    },

    updateProfileAvatar: async (...args) => {
        ensureImpl();
        return implementation.updateProfileAvatar(...args);
    },

    updateProfileBio: async (...args) => {
        ensureImpl();
        return implementation.updateProfileBio(...args);
    },

    profileExistsForUser: async (...args) => {
        ensureImpl();
        return implementation.profileExistsForUser(...args);
    }
}