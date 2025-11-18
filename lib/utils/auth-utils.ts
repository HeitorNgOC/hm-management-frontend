export interface ParsedAuthResponse {
  jwt?: string | undefined
  refreshToken?: string | undefined
  user?: any
}

// Parse multiple possible token shapes returned by backend and extract a
// consistent shape: { jwt, refreshToken, user }
export function parseAuthResponse(resp: any): ParsedAuthResponse {
  if (!resp) return {}

  // If Axios already unwrapped an envelope, it may already be the inner payload
  const payload = resp?.data ?? resp

  // Several possible shapes to support:
  // - { token: 'jwt', refreshToken, user }
  // - { token: { token: 'jwt', refreshToken } , user }
  // - { jwt: 'jwt', refreshToken, user }
  // - { token: 'jwt' } (no user)
  // - 'raw-jwt-string'

  let jwt: string | undefined
  let refreshToken: string | undefined
  let user: any

  if (typeof resp === "string") {
    jwt = resp
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.token === "string") {
      jwt = payload.token
      refreshToken = payload.refreshToken
      user = payload.user ?? payload.data ?? payload.user
    } else if (payload.token && typeof payload.token === "object") {
      jwt = payload.token.token ?? undefined
      refreshToken = payload.token.refreshToken ?? undefined
      user = payload.user ?? payload.data ?? undefined
    } else if (typeof payload.jwt === "string") {
      jwt = payload.jwt
      refreshToken = payload.refreshToken
      user = payload.user ?? payload.data
    } else if (payload.user || payload.data) {
      // Might be only a user payload (e.g. me())
      user = payload.user ?? payload.data
    }
  }

  return { jwt, refreshToken, user }
}

export function safeSetUserLocalStorage(key: string, user: any) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(user ?? null))
  } catch (e) {
    // ignore
  }
}

export function safeGetUserLocalStorage(key: string) {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function safeRemoveUserLocalStorage(key: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch (e) {}
}
