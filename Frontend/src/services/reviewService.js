import { apiClient } from '../utils/apiClient';

// Helpers to unwrap backend ResponseData envelope
const unwrap = (res) => res?.data ?? res;

const base = '/reviews';

const reviewService = {
    /**
     * Create a new review
     * @param {Object} reviewData - ReviewRequest: { movieId: Long, comment: String, rating: Integer, parentId?: Long }
     * @param {number} reviewData.movieId - Movie ID
     * @param {string} reviewData.comment - Review comment text
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {number} [reviewData.parentId] - Parent review ID (optional, for replies)
     * @returns {Promise<Object>} Created review
     */
    async createReview(reviewData) {
        const res = await apiClient.post(base, reviewData);
        return unwrap(res);
    },

    /**
     * Update an existing review
     * @param {number} reviewId - Review ID
     * @param {Object} reviewData - ReviewRequest: { movieId: Long, comment: String, rating: Integer, parentId?: Long }
     * @param {number} reviewData.movieId - Movie ID
     * @param {string} reviewData.comment - Review comment text
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {number} [reviewData.parentId] - Parent review ID (optional, for replies)
     * @returns {Promise<Object>} Updated review
     */
    async updateReview(reviewId, reviewData) {
        const res = await apiClient.put(`${base}/${reviewId}`, reviewData);
        return unwrap(res);
    },

    /**
     * Delete a review
     * @param {number} reviewId - Review ID
     * @returns {Promise<void>}
     */
    async deleteReview(reviewId) {
        const res = await apiClient.delete(`${base}/${reviewId}`);
        return unwrap(res);
    },

    /**
     * Get a review by ID
     * @param {number} reviewId - Review ID
     * @returns {Promise<Object>} Review details with replies
     */
    async getReviewById(reviewId) {
        const res = await apiClient.get(`${base}/${reviewId}`);
        return unwrap(res);
    },

    /**
     * Get all reviews for a movie (paginated)
     * @param {number} movieId - Movie ID
     * @param {Object} params - { page: 0, size: 5, sort: 'createdAt,desc' }
     * @returns {Promise<Object>} Paginated reviews { content, totalElements, totalPages, ... }
     */
    async getReviewsByMovie(movieId, params = { page: 0, size: 10 }) {
        const res = await apiClient.get(`${base}/movie/${movieId}`, { params });
        return unwrap(res);
    },

    /**
     * Get reviews array only (no pagination info)
     * @param {number} movieId - Movie ID
     * @param {Object} params - Query params
     * @returns {Promise<Array>} Array of reviews
     */
    async getReviewsByMovieArray(movieId, params = { page: 0, size: 10 }) {
        const res = await this.getReviewsByMovie(movieId, params);
        return Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
    },

    /**
     * Add a reply to a review
     * @param {number} parentId - Parent review ID
     * @param {Object} replyData - ReviewRequest: { movieId: Long, comment: String, rating: Integer }
     * @param {number} replyData.movieId - Movie ID
     * @param {string} replyData.comment - Reply comment text
     * @param {number} replyData.rating - Rating (1-5)
     * @returns {Promise<Object>} Created reply
     */
    async addReply(parentId, replyData) {
        return this.createReview({ ...replyData, parentId });
    },

    /**
     * Get movie reviews with default pagination
     * @param {number} movieId - Movie ID
     * @returns {Promise<Object>} Paginated reviews
     */
    async getMovieReviews(movieId) {
        return this.getReviewsByMovie(movieId, { page: 0, size: 10 });
    },

    /**
     * Load more reviews (next page)
     * @param {number} movieId - Movie ID
     * @param {number} page - Page number
     * @param {number} size - Page size
     * @returns {Promise<Object>} Paginated reviews
     */
    async loadMoreReviews(movieId, page = 1, size = 10) {
        return this.getReviewsByMovie(movieId, { page, size });
    },

    /**
     * Get average rating for a movie
     * @param {number} movieId - Movie ID
     * @returns {Promise<Object>} { averageRating: number, countRating: number }
     */
    async getAverageRating(movieId) {
        const res = await apiClient.get(`${base}/average-rating/${movieId}`);
        return unwrap(res);
    },

    /**
     * Get all reviews/comments (Admin)
     * @param {Object} params - { page: 0, size: 10, sort: 'createdAt,desc' }
     * @returns {Promise<Object>} Paginated reviews { content, totalElements, totalPages, ... }
     */
    async getAllReviews(params = { page: 0, size: 10 }) {
        const res = await apiClient.get(`${base}`, { params });
        return unwrap(res);
    },

    /**
     * Approve a review/comment (Admin)
     * @param {number} reviewId - Review ID
     * @returns {Promise<Object>} Updated review
     */
    async approveReview(reviewId) {
        const res = await apiClient.put(`${base}/${reviewId}/approve`);
        return unwrap(res);
    },

    /**
     * Reject a review/comment (Admin)
     * @param {number} reviewId - Review ID
     * @returns {Promise<Object>} Updated review
     */
    async rejectReview(reviewId) {
        const res = await apiClient.put(`${base}/${reviewId}/reject`);
        return unwrap(res);
    }
};

export default reviewService;

