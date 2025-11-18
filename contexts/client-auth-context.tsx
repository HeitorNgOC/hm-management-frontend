"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { safeGetUserLocalStorage, safeRemoveUserLocalStorage, safeSetUserLocalStorage, parseAuthResponse } from "@/lib/utils/auth-utils"

interface ClientAuthContextType {
  client: any | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  exchangeMagicToken: (magicToken: string) => Promise<void>
  logout: () => void
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined)

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any | null>(() => safeGetUserLocalStorage("client_user"))
  const [token, setToken] = useState<string | null>(() => (typeof window !== "undefined" ? localStorage.getItem("client_token") : null))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiClient.get("/clients/me")
        const payload = res?.data ?? res
        setClient(payload)
        safeSetUserLocalStorage("client_user", payload)
      } catch (e) {
        // token invalid or network error — clear client session
        safeRemoveUserLocalStorage("client_user")
        try { localStorage.removeItem("client_token") } catch {}
        setClient(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const exchangeMagicToken = async (magicToken: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/clients/exchange-token", { token: magicToken })
      const payload = response?.data ?? response
      const parsed = parseAuthResponse(payload)

      if (parsed.jwt) {
        try { localStorage.setItem("client_token", parsed.jwt) } catch {}
        safeSetUserLocalStorage("client_user", parsed.user ?? null)
        setToken(parsed.jwt)
        setClient(parsed.user ?? null)
      } else {
        throw new Error("Invalid exchange response")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try { localStorage.removeItem("client_token") } catch {}
    safeRemoveUserLocalStorage("client_user")
    setClient(null)
    setToken(null)
  }

  const value: ClientAuthContextType = {
    client,
    token,
    isAuthenticated: !!client && !!token,
    isLoading,
    exchangeMagicToken,
    logout,
  }

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext)
  if (!ctx) throw new Error("useClientAuth must be used within ClientAuthProvider")
  return ctx
}
