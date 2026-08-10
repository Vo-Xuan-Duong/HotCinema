import { apiClient } from "@/utils/apiClient"

const unwrap = (response) => response?.data ?? response

const settingsService = {
  async get() {
    return unwrap(await apiClient.get("/settings"))
  },
  async update(settings) {
    return unwrap(await apiClient.put("/settings", settings))
  },
}

export default settingsService
