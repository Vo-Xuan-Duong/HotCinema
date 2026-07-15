import apiClient from '@/utils/apiClient';

const base = '/genres';

/**
 * Helper to unwrap ResponseData to just the data field
 */
const unwrap = (res) => res?.data?.data || res?.data || res;

/**
 * Helper to unwrap array responses
 */
const unwrapArray = (res) => {
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
};

const genreService = {
    /**
     * Get all genres
     * @returns {Promise<Array>} List of all genres
     */
    async getAllGenres() {
        const res = await apiClient.get(base);
        return unwrapArray(res);
    },

    /**
     * Get genre by ID
     * @param {number|string} id - Genre ID
     * @returns {Promise<Object>} Genre details
     */
    async getGenreById(id) {
        const res = await apiClient.get(`${base}/${id}`);
        return unwrap(res);
    },

    /**
     * Get genre by name
     * @param {string} name - Genre name
     * @returns {Promise<Object>} Genre details
     */
    async getGenreByName(name) {
        const res = await apiClient.get(`${base}/name/${name}`);
        return unwrap(res);
    },

    /**
     * Create a new genre
     * @param {Object} genreData - Genre data
     * @param {string} genreData.name - Genre name
     * @param {string} [genreData.description] - Genre description
     * @returns {Promise<Object>} Created genre
     */
    async createGenre(genreData) {
        const res = await apiClient.post(base, genreData);
        return unwrap(res);
    },

    /**
     * Update an existing genre
     * @param {number|string} id - Genre ID
     * @param {Object} genreData - Updated genre data
     * @param {string} genreData.name - Genre name
     * @param {string} [genreData.description] - Genre description
     * @returns {Promise<Object>} Updated genre
     */
    async updateGenre(id, genreData) {
        const res = await apiClient.put(`${base}/${id}`, genreData);
        return unwrap(res);
    },

    /**
     * Delete a genre
     * @param {number|string} id - Genre ID
     * @returns {Promise<void>}
     */
    async deleteGenre(id) {
        const res = await apiClient.delete(`${base}/${id}`);
        return unwrap(res);
    },
};

export default genreService;
