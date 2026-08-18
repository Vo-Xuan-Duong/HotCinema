export const isEndpointUnavailable = (error) => [404, 405, 501].includes(
  error?.status || error?.response?.status,
);

export const createCapabilityError = (feature, cause) => {
  const error = new Error(`Tính năng ${feature} chưa được backend hỗ trợ đầy đủ.`);
  error.code = 'BACKEND_CAPABILITY_MISSING';
  error.feature = feature;
  error.status = cause?.status || cause?.response?.status || 501;
  error.cause = cause;
  error.response = cause?.response;
  return error;
};

export const rethrowCapabilityError = (feature, error) => {
  if (isEndpointUnavailable(error)) throw createCapabilityError(feature, error);
  throw error;
};
