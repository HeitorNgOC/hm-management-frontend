export interface EmployeeTimeInterval {
  id: string
  employeeId: string
  dayOfWeek: DayOfWeek
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  breakStartTime?: string
  breakEndTime?: string
  isWorkDay: boolean
  createdAt: string
  updatedAt: string
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday to Saturday

export interface CreateEmployeeTimeIntervalRequest {
  employeeId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  breakStartTime?: string
  breakEndTime?: string
  isWorkDay: boolean
}

export interface UpdateEmployeeTimeIntervalRequest {
  startTime?: string
  endTime?: string
  breakStartTime?: string
  breakEndTime?: string
  isWorkDay?: boolean
}

export interface EmployeeTimeIntervalFilters {
  employeeId?: string
  dayOfWeek?: DayOfWeek
}
