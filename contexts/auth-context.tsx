"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { LoginRequest, RegisterRequest } from "@/lib/types/auth"
import type { User, Permission } from "@/lib/types/user"
import { authService } from "@/lib/services/auth.service"
import { useToast } from "@/hooks/use-toast"
import { storeTokens, clearTokens, getAuthToken } from "@/lib/utils/token"
import { parseAuthResponse, safeGetUserLocalStorage, safeSetUserLocalStorage, safeRemoveUserLocalStorage } from "@/lib/utils/auth-utils"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  updateSessionWithInvite: (inviteResponse: { token: { token: string, refreshToken: string }, user: User }) => Promise<void>
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getAuthToken()
        if (!storedToken) {
          setIsLoading(false)
          return
        }

        setToken(storedToken)

        const storedUser = safeGetUserLocalStorage("user")
        if (storedUser) {
          setUser({ ...storedUser, permissions: Array.isArray(storedUser.permissions) ? storedUser.permissions : [] })
        }

        try {
          const completeUser = await authService.me()
          if (!completeUser) {
            clearTokens()
            setToken(null)
            setUser(null)
            router.push('/login')
            return
          }

          const normalized = { ...completeUser, permissions: Array.isArray(completeUser?.permissions) ? completeUser.permissions : [] }
          setUser(normalized)
          safeSetUserLocalStorage("user", normalized)
        } catch (err: any) {
          const status = err?.response?.status
          if (status === 401) {
            // Unauthorized - token invalid: clear session and force login
            clearTokens()
            setToken(null)
            setUser(null)
            router.push('/login')
          } else if (status === 403) {
            // Forbidden - user doesn't have permissions for the requested resource.
            // Keep the session (don't clear tokens) and send user to unauthorized page.
            router.push('/unauthorized')
          } else {
            console.error("[v0] Error fetching current user:", err)
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
      const res = await authService.login(credentials)

      // Support multiple token shapes returned by the backend:
      // - res.token = { token: string, refreshToken?: string }
      // - res.token = string (access token)
      // - res = { token: string, refreshToken?: string, user }
      let jwt: string | undefined = undefined
      let refreshToken: string | undefined = undefined

      if (res) {
        if (typeof (res as any).token === "string") {
          jwt = (res as any).token
        } else if (res.token && typeof (res.token as any) === "object") {
          jwt = (res.token as any).token ?? (res.token as any)
          refreshToken = (res.token as any).refreshToken
        } else if ((res as any).jwt) {
          jwt = (res as any).jwt
          refreshToken = (res as any).refreshToken
        }
      }

      if (!res || !jwt || !res.user) {
        toast({
          title: "Erro ao fazer login",
          description: "Credenciais inválidas",
        })
      } else {
        storeTokens(jwt, refreshToken)
        setToken(jwt)

        const normalizedUser = { ...res.user, permissions: Array.isArray(res.user?.permissions) ? res.user.permissions : [] }
        setUser(normalizedUser)
        safeSetUserLocalStorage("user", normalizedUser)

        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${res.user.email}!`,
        })

        if (res.user.role === "ADMIN") {
          router.push("/admin/dashboard")
        } else if (res.user.role === "MANAGER") {
          router.push("/manager/dashboard")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      toast({
        title: "Erro ao fazer login",
        description: "Erro ao tentar conectar ao servidor",
      })
      return
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const res = await authService.register(data)

      if (!res || !res.token || !res.user) {
        toast({
          title: "Erro ao criar conta",
          description: "Não foi possível criar sua conta",
        })
      } else {
        const { token: jwt, refreshToken } = res.token
        storeTokens(jwt, refreshToken)
        setToken(jwt)

        const normalizedUser = { ...res.user, permissions: Array.isArray(res.user?.permissions) ? res.user.permissions : [] }
        setUser(normalizedUser)
        safeSetUserLocalStorage("user", normalizedUser)

        toast({
          title: "Cadastro realizado com sucesso",
          description: `Sua conta foi criada. Bem-vindo(a) ${res.user.name}!`,
        })

        router.push("/admin/dashboard")
      }
    } catch (error: any) {
      console.error("[v0] Register error:", error)
      toast({
        title: "Erro ao criar conta",
        description: "Erro ao tentar conectar ao servidor",
      })
      return
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

      // Remove stored user representation as well
      safeRemoveUserLocalStorage("user")

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      })

      router.push("/login")
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    return perms.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    return permissions.some((permission) => perms.includes(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    return permissions.every((permission) => perms.includes(permission))
  }

  const hasRole = (role: User["role"]): boolean => {
    if (!user) return false
    return user.role === role
  }

  const updateSessionWithInvite = async (inviteResponse: { token: { token: string, refreshToken: string }, user: User }) => {
    const { token: newToken, refreshToken } = inviteResponse.token
    storeTokens(newToken, refreshToken)
    setToken(newToken)

    const normalizedUser = { ...inviteResponse.user, permissions: Array.isArray(inviteResponse.user?.permissions) ? inviteResponse.user.permissions : [] }
    setUser(normalizedUser)
    safeSetUserLocalStorage("user", normalizedUser)

    toast({
      title: "Conta ativada com sucesso",
      description: "Bem-vindo! Sua conta foi ativada.",
    })

    if (inviteResponse.user.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (inviteResponse.user.role === "MANAGER") {
      router.push("/manager/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    updateSessionWithInvite,
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
