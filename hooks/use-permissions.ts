"use client"

import { useAuth } from "@/contexts/auth-context"

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, user } = useAuth()

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    user,
    // Convenience helpers for common permission checks
    canViewUsers: hasPermission("users.view"),
    canCreateUsers: hasPermission("users.create"),
    canEditUsers: hasPermission("users.edit"),
    canDeleteUsers: hasPermission("users.delete"),
    canManageUsers: hasAllPermissions(["users.view", "users.create", "users.edit", "users.delete"]),
    canViewInventory: hasPermission("inventory.view"),
    canManageInventory: hasAllPermissions(["inventory.view", "inventory.create", "inventory.edit", "inventory.delete"]),
    canViewFinancial: hasPermission("financial.view"),
    canManageFinancial: hasAllPermissions(["financial.view", "financial.create", "financial.edit", "financial.delete"]),
    canViewReports: hasPermission("reports.view"),
    canExportReports: hasPermission("reports.export"),
    canViewSettings: hasPermission("settings.view"),
    canEditSettings: hasPermission("settings.edit"),
    isAdmin: hasRole("ADMIN"),
    isManager: hasRole("MANAGER"),
    isEmployee: hasRole("EMPLOYEE"),
  }
}
