
module.exports = {
    /**
     * Usado por login
     * @param {string} identifier
     * @returns {Promise<{ id: string|number, passwordHash: string } | null>}
     */
    findForAuth: async (identifier) => {
        throw new Error('User port not implemented');
    },

    /**
     * Usado por register
     * @param {{ email: string, passwordHash: string, username?: string }}
     * @returns {Promise<{ id: string|number }>}
     */
    createForAuth: async (data) => {
        throw new Error('User port not implemented');
    },

    /**
     * Opcional: comprobar existencia
     * @param {string} email
     * @returns {Promise<boolean>}
     */
    existsByEmail: async (email) => {
        throw new Error('User port not implemented');
    },

    /**
     * Usado por /me
     * @param {string|number} userId
     * @returns {Promise<object|null>}
     */
    findPublicProfileById: async (userId) => {
        throw new Error('User port not implemented');
    },
};