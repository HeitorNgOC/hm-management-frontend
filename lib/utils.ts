import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Ensure the value is an array. If the value is an API envelope with a `data` array,
 * it will return that. Otherwise returns an empty array.
 */
export function ensureArray<T>(value: unknown): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value as T[]
  // ApiResponse shape { data: T[] }
  if (typeof value === "object" && value !== null && "data" in value) {
    const inner = (value as any).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}
