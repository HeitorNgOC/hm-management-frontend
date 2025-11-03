export interface Goal {
  id: string
  companyId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  category: GoalCategory
  startDate: string
  endDate: string
  status: GoalStatus
  priority: GoalPriority
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export type GoalCategory = "revenue" | "expense_reduction" | "customer_acquisition" | "employee_sales"

export type GoalStatus = "not_started" | "in_progress" | "completed" | "failed" | "paused"

export type GoalPriority = "low" | "medium" | "high" | "critical"

export interface CreateGoalRequest {
  name: string
  description?: string
  targetAmount: number
  category: GoalCategory
  startDate: string
  endDate: string
  priority: GoalPriority
  assignedTo?: string
}

export interface UpdateGoalRequest {
  name?: string
  description?: string
  targetAmount?: number
  category?: GoalCategory
  startDate?: string
  endDate?: string
  status?: GoalStatus
  priority?: GoalPriority
  currentAmount?: number
}

export interface GoalFilters {
  category?: GoalCategory
  status?: GoalStatus
  priority?: GoalPriority
}
