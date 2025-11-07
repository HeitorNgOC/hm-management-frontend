"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { LoginRequest, RegisterRequest } from "@/lib/types/auth"
import type { User, Permission } from "@/lib/types/user"
import { authService } from "@/lib/services/auth.service"
import { useToast } from "@/hooks/use-toast"
import { storeTokens, clearTokens, getAuthToken } from "@/lib/utils/token"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasRole: (role: User["role"]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getAuthToken()
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null

        if (!storedToken) {
          return
        }

        // Always set token when present
        setToken(storedToken)

        // If we have a cached user, use it immediately for a smoother UX
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {}
        }

        // Verify token by fetching the current user
        try {
          const currentUser = await authService.currentUser()
          setUser(currentUser)
          localStorage.setItem("user", JSON.stringify(currentUser))
        } catch (error: any) {
          // Only clear tokens on explicit auth failures
          const status = error?.response?.status
          if (status === 401 || status === 403) {
            console.error("[v0] Token invalid on init:", error)
            clearTokens()
            setToken(null)
            setUser(null)
          } else {
            // Network/server errors: keep existing token and any cached user; allow app to retry later
            console.warn("[v0] currentUser fetch failed (non-auth). Keeping session:", error?.message || error)
          }
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)

      // Store tokens and fetch full user profile (with permissions)
      storeTokens(response.token.token, response.token.refreshToken)
      setToken(response.token.token)

      // Seed session with user from login (contains companyId/name)
      try {
        localStorage.setItem("user", JSON.stringify(response.user))
      } catch {}

  // Fetch the complete user object to ensure permissions/relations are present
  const currentUser = await authService.currentUser()
      setUser(currentUser)
      localStorage.setItem("user", JSON.stringify(currentUser))

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${response.user.email}!`,
      })

      // Redirect based on role
      if (response.user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (response.user.role === "MANAGER") {
        router.push("/manager/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      toast({
        title: "Erro ao fazer login",
        description: error.response?.data?.message || "Credenciais inválidas",
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data)

      // Store tokens and fetch full user profile (with permissions)
      storeTokens(response.token.token, response.token.refreshToken)
      setToken(response.token.token)

      // Seed session with user from register (contains companyId/name)
      try {
        localStorage.setItem("user", JSON.stringify(response.user))
      } catch {}

  const currentUser = await authService.currentUser()
      setUser(currentUser)
      localStorage.setItem("user", JSON.stringify(currentUser))

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Sua conta foi criada. Bem-vindo!",
      })

      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("[v0] Register error:", error)
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.message || "Não foi possível criar sua conta",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      clearTokens()
      setToken(null)
      setUser(null)

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      })

      router.push("/login")
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.some((permission) => user.permissions.includes(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.every((permission) => user.permissions.includes(permission))
  }

  const hasRole = (role: User["role"]): boolean => {
    if (!user) return false
    return user.role === role
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
