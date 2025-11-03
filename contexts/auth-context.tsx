"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, LoginRequest, RegisterRequest, Permission } from "@/lib/types/auth"
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
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))

          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authService.me()
            setUser(currentUser)
            localStorage.setItem("user", JSON.stringify(currentUser))
          } catch (error) {
            // Token is invalid, clear auth state
            console.error("[v0] Token validation failed:", error)
            clearTokens()
            setToken(null)
            setUser(null)
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
      // const response = await authService.login(credentials)
      const mockUser: User = {
        id: "123456789",
        email: "admin@example.com",
        name: "Admin User",
        phone: "+55 11 99999-9999",
        avatar: "https://ui-avatars.com/api/?name=Admin+User",
        role: "ADMIN",
        status: "ACTIVE",
        companyId: "company_001",
        positionId: "position_admin",
        permissions: [
          "users.view",
          "users.create",
          "users.edit",
          "users.delete",
          "positions.view",
          "positions.create",
          "positions.edit",
          "positions.delete",
          "appointments.view",
          "appointments.create",
          "appointments.edit",
          "appointments.delete",
          "inventory.view",
          "inventory.create",
          "inventory.edit",
          "inventory.delete",
          "restaurant.view",
          "restaurant.create",
          "restaurant.edit",
          "restaurant.delete",
          "financial.view",
          "financial.create",
          "financial.edit",
          "financial.delete",
          "reports.view",
          "reports.export",
          "settings.view",
          "settings.edit",
          "payments.view",
          "payments.manage"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };


      // Fake token (JWT-like structure)
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImNvbXBhbnlJZCI6ImNvbXBhbnlfMDAxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MzE1MzYwMDB9.signature_mock_placeholder";

      storeTokens(mockToken, mockToken)
      localStorage.setItem("user", JSON.stringify(mockUser))

      setToken(mockToken)
      setUser(mockUser)

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${mockUser.name}!`,
      })

      // Redirect based on role
      if (mockUser.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (mockUser.role === "MANAGER") {
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

      storeTokens(response.token, response.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.user))

      setToken(response.token)
      setUser(response.user)

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
