import { getAuthToken, decodeToken } from "@/lib/utils/token"

export function getSessionCompanyId(): string {
  // Prefer session user stored in localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const user = JSON.parse(raw)
        if (user?.companyId) return String(user.companyId)
      }
    } catch {}
  }

  // Fallback to decode token
  const token = getAuthToken()
  if (token) {
    try {
      const payload: any = decodeToken(token)
      if (payload?.companyId) return String(payload.companyId)
    } catch {}
  }

  throw new Error("companyId not found in session or token payload")
}