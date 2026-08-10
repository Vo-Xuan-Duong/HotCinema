import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/reviews';

const reviewService = {
  async createReview(reviewData) {
    return unwrapApiData(await apiClient.post(base, reviewData));
  },

  async updateReview(reviewId, reviewData) {
    return unwrapApiData(await apiClient.put(`${base}/${reviewId}`, reviewData));
  },

  async deleteReview(reviewId) {
    return unwrapApiData(await apiClient.delete(`${base}/${reviewId}`));
  },

  async getReviewById(reviewId) {
    return unwrapApiData(await apiClient.get(`${base}/${reviewId}`));
  },

  async getReviewsByMovie(movieId, params = { page: 0, size: 10 }) {
    return unwrapApiData(await apiClient.get(`${base}/movie/${movieId}`, { params }));
  },

  async getReviewsByMovieArray(movieId, params = { page: 0, size: 10 }) {
    return unwrapApiArray(await this.getReviewsByMovie(movieId, params));
  },

  async addReply(parentId, replyData) {
    return this.createReview({ ...replyData, parentId });
  },

  async getMovieReviews(movieId) {
    return this.getReviewsByMovie(movieId, { page: 0, size: 10 });
  },

  async loadMoreReviews(movieId, page = 1, size = 10) {
    return this.getReviewsByMovie(movieId, { page, size });
  },

  async getAverageRating(movieId) {
    return unwrapApiData(await apiClient.get(`${base}/average-rating/${movieId}`));
  },

  async getAllReviews(params = { page: 0, size: 10 }) {
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async approveReview(reviewId) {
    return unwrapApiData(await apiClient.put(`${base}/${reviewId}/approve`));
  },

  async rejectReview(reviewId) {
    return unwrapApiData(await apiClient.put(`${base}/${reviewId}/reject`));
  },
};

export default reviewService;
