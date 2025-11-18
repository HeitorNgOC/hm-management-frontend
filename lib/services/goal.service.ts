import { apiClient } from "@/lib/api-client"
import type { Goal, CreateGoalRequest, UpdateGoalRequest, GoalFilters } from "@/lib/types/goal"

const goalService = {
  getAll: async (filters?: GoalFilters) => {
    const response = await apiClient.get("/goals", { params: filters })
    const payload: any = response.data ?? {}
    if (Array.isArray(payload)) return payload as Goal[]
    if (Array.isArray(payload.data)) return payload.data as Goal[]
    if (Array.isArray(payload.items)) return payload.items as Goal[]
    return [] as Goal[]
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/goals/${id}`)
    return response.data as Goal
  },

  create: async (data: CreateGoalRequest) => {
    const response = await apiClient.post("/goals", data)
    return response.data as Goal
  },

  update: async (id: string, data: UpdateGoalRequest) => {
    const response = await apiClient.put(`/goals/${id}`, data)
    return response.data as Goal
  },

  delete: async (id: string) => {
    await apiClient.delete(`/goals/${id}`)
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post("/goals/bulk-delete", { ids })
  },
}

export { goalService }
