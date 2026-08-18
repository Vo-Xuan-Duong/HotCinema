import { createCapabilityError } from '@/utils/backendCapability';

const unsupported = () => {
  throw createCapabilityError('movie version; backend hiện không có MovieVersion resource/controller');
};

const movieVersionService = {
  isSupported() {
    return false;
  },

  async createMovieVersion() {
    return unsupported();
  },

  async getMovieVersionById() {
    return unsupported();
  },

  async getAllMovieVersions() {
    return unsupported();
  },

  async getMovieVersionsByMovieId() {
    return unsupported();
  },

  async updateMovieVersion() {
    return unsupported();
  },

  async deleteMovieVersion() {
    return unsupported();
  },
};

export default movieVersionService;
