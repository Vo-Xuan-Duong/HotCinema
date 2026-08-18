import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { createCapabilityError } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const base = '/reviews';

const requireReviewBackend = () => {
  if (!MOCK_API_ENABLED) {
    throw createCapabilityError('review/bình luận (backend hiện chưa có ReviewController)');
  }
};

const reviewService = {
  isSupported() {
    return MOCK_API_ENABLED;
  },

  async createReview(reviewData) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.post(base, reviewData));
  },

  async updateReview(reviewId, reviewData) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(reviewId)}`, reviewData));
  },

  async deleteReview(reviewId) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.delete(`${base}/${normalizeResourceId(reviewId)}`));
  },

  async getReviewById(reviewId) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(reviewId)}`));
  },

  async getReviewsByMovie(movieId, params = { page: 0, size: 10 }) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.get(`${base}/movie/${normalizeResourceId(movieId)}`, { params }));
  },

  async getReviewsByMovieArray(movieId, params = { page: 0, size: 10 }) {
    return unwrapApiArray(await this.getReviewsByMovie(movieId, params));
  },

  async addReply(parentId, replyData) {
    return this.createReview({ ...replyData, parentId: normalizeResourceId(parentId) });
  },

  async getMovieReviews(movieId) {
    return this.getReviewsByMovie(movieId, { page: 0, size: 10 });
  },

  async loadMoreReviews(movieId, page = 1, size = 10) {
    return this.getReviewsByMovie(movieId, { page, size });
  },

  async getAverageRating(movieId) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.get(`${base}/average-rating/${normalizeResourceId(movieId)}`));
  },

  async getAllReviews(params = { page: 0, size: 10 }) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async approveReview(reviewId) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(reviewId)}/approve`));
  },

  async rejectReview(reviewId) {
    requireReviewBackend();
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(reviewId)}/reject`));
  },
};

export default reviewService;
