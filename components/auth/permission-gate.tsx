"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Permission, UserRole } from "@/lib/types/auth"

interface PermissionGateProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasRole } = useAuth()

  // Check role requirements
  if (roles.length > 0) {
    const hasRequiredRole = requireAll ? roles.every((role) => hasRole(role)) : roles.some((role) => hasRole(role))

    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermission = requireAll
      ? permissions.every((permission) => hasPermission(permission))
      : permissions.some((permission) => hasPermission(permission))

    if (!hasRequiredPermission) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
