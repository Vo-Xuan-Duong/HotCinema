const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

/**
 * Normalize the application response envelope after apiClient has already
 * removed the Axios response wrapper.
 *
 * Supported shapes:
 * - payload
 * - { data: payload }
 */
export const unwrapApiData = (response) => {
  if (response && typeof response === 'object' && !Array.isArray(response) && hasOwn(response, 'data')) {
    return response.data;
  }
  return response;
};

export const unwrapApiArray = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

export const unwrapApiPage = (response) => {
  const data = unwrapApiData(response);
  return data && typeof data === 'object' ? data : {};
};
