import apiClient from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { normalizeResourceId } from '@/utils/resourceId';

const base = '/genres';

const toGenrePayload = (genreData = {}) => ({
  name: String(genreData.name || '').trim(),
  slug: String(genreData.slug || '').trim(),
});

const genreService = {
  async getAllGenres(params = {}) {
    return unwrapApiArray(await apiClient.get(base, {
      params: { page: 0, size: 100, ...params },
    }));
  },

  async getGenreById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(id)}`));
  },

  async getGenreByName(name) {
    // GenreController exposes only paged CRUD; there is no /name/{name}
    // endpoint. Genres are public reference data, so resolving by name from
    // the bounded collection is safe and avoids calling a non-existent API.
    const normalizedName = String(name || '').trim().toLocaleLowerCase('vi-VN');
    const rows = await this.getAllGenres({ page: 0, size: 200 });
    return rows.find((genre) => String(genre.name || '').trim().toLocaleLowerCase('vi-VN') === normalizedName) || null;
  },

  async createGenre(genreData) {
    return unwrapApiData(await apiClient.post(base, toGenrePayload(genreData)));
  },

  async updateGenre(id, genreData) {
    return unwrapApiData(await apiClient.put(
      `${base}/${normalizeResourceId(id)}`,
      toGenrePayload(genreData),
    ));
  },

  async deleteGenre(id) {
    await apiClient.delete(`${base}/${normalizeResourceId(id)}`);
  },
};

export { toGenrePayload };
export default genreService;
