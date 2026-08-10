import { apiClient } from "@/utils/apiClient"

const unwrap = (response) => response?.data ?? response
const unwrapList = (response) => {
  const data = unwrap(response)
  return Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
}

const concessionService = {
  async list(params) {
    return unwrapList(await apiClient.get("/concessions", { params }))
  },
  async create(payload) {
    return unwrap(await apiClient.post("/concessions", payload))
  },
  async update(id, payload) {
    return unwrap(await apiClient.put(`/concessions/${id}`, payload))
  },
  async delete(id) {
    return unwrap(await apiClient.delete(`/concessions/${id}`))
  },
}

export default concessionService
