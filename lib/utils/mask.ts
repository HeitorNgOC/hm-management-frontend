// Simple masking and normalization helpers

// Format Brazilian phone numbers to (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export function formatPhoneBR(input: string): string {
  if (!input) return ""
  const digits = input.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) {
    // (XX) XXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    // (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // 11 digits: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Normalize email: trim spaces and force lowercase
export function normalizeEmail(input: string): string {
  if (!input) return ""
  return input.replace(/\s+/g, "").toLowerCase()
}

// Format CPF as 000.000.000-00 from digits
export function formatCpf(input: string): string {
  if (!input) return ""
  const digits = input.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
