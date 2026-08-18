import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { normalizeResourceId } from '@/utils/resourceId';

const normalizeAssignment = (assignment = {}) => ({
  ...assignment,
  id: normalizeResourceId(assignment.id),
  userId: normalizeResourceId(assignment.userId),
  cinemaId: normalizeResourceId(assignment.cinemaId),
  position: String(assignment.position || 'STAFF').trim().toUpperCase(),
  isActive: Boolean(assignment.isActive),
  assignedAt: assignment.assignedAt || null,
  endedAt: assignment.endedAt || null,
});

const toAssignmentPayload = (data = {}) => ({
  userId: normalizeResourceId(data.userId),
  cinemaId: normalizeResourceId(data.cinemaId),
  position: String(data.position || 'STAFF').trim().toUpperCase(),
  isActive: Boolean(data.isActive),
  assignedAt: data.assignedAt,
  endedAt: data.endedAt,
});

const employeeCinemaService = {
  async listPage(params = {}) {
    const data = unwrapApiData(await apiClient.get(ENDPOINTS.EMPLOYEE_CINEMAS, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }));

    if (Array.isArray(data)) return data.map(normalizeAssignment);
    if (Array.isArray(data?.content)) {
      return { ...data, content: data.content.map(normalizeAssignment) };
    }
    return data;
  },

  async getById(id) {
    return normalizeAssignment(unwrapApiData(
      await apiClient.get(`${ENDPOINTS.EMPLOYEE_CINEMAS}/${normalizeResourceId(id)}`),
    ));
  },

  async create(data) {
    return normalizeAssignment(unwrapApiData(
      await apiClient.post(ENDPOINTS.EMPLOYEE_CINEMAS, toAssignmentPayload(data)),
    ));
  },

  async update(id, data) {
    return normalizeAssignment(unwrapApiData(
      await apiClient.put(
        `${ENDPOINTS.EMPLOYEE_CINEMAS}/${normalizeResourceId(id)}`,
        toAssignmentPayload(data),
      ),
    ));
  },

  async setActive(assignment, isActive) {
    return this.update(assignment.id, {
      ...assignment,
      isActive,
    });
  },

  async delete(id) {
    return apiClient.delete(`${ENDPOINTS.EMPLOYEE_CINEMAS}/${normalizeResourceId(id)}`);
  },
};

export { normalizeAssignment, toAssignmentPayload };
export default employeeCinemaService;
