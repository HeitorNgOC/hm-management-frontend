"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Permission, UserRole } from "@/lib/types/user"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  requireAll?: boolean // If true, user must have ALL permissions/roles. If false, ANY permission/role is enough
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  fallbackUrl = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(fallbackUrl)
      return
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requireAll
        ? requiredRoles.every((role) => hasRole(role))
        : requiredRoles.some((role) => hasRole(role))

      if (!hasRequiredRole) {
        router.push("/unauthorized")
        return
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = requireAll
        ? requiredPermissions.every((permission) => hasPermission(permission))
        : requiredPermissions.some((permission) => hasPermission(permission))

      if (!hasRequiredPermission) {
        router.push("/unauthorized")
        return
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requiredPermissions,
    requiredRoles,
    requireAll,
    fallbackUrl,
    router,
    hasPermission,
    hasRole,
  ])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render children until auth is verified
  if (!isAuthenticated) {
    return null
  }

  // Check permissions before rendering
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requireAll
      ? requiredRoles.every((role) => hasRole(role))
      : requiredRoles.some((role) => hasRole(role))

    if (!hasRequiredRole) {
      return null
    }
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requireAll
      ? requiredPermissions.every((permission) => hasPermission(permission))
      : requiredPermissions.some((permission) => hasPermission(permission))

    if (!hasRequiredPermission) {
      return null
    }
  }

  return <>{children}</>
}
