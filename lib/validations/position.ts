import { z } from "zod"
import { AVAILABLE_PERMISSIONS } from "@/lib/types/position"
import type { Permission } from "@/lib/types/user"

const permissionKeys = AVAILABLE_PERMISSIONS.map((p) => p.key) as [string, ...string[]]

const PermissionEnum = z.enum(permissionKeys)

export const createPositionSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  permissions: z.array(PermissionEnum).min(1, "Selecione pelo menos uma permissão"),
})

export const updatePositionSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  description: z.string().optional(),
  permissions: z.array(PermissionEnum).optional(),
})

// Derive the form data types directly from the zod schemas so they stay
// consistent with the resolver (avoids resolver/control generic mismatches).
export type CreatePositionFormData = z.infer<typeof createPositionSchema>
export type UpdatePositionFormData = z.infer<typeof updatePositionSchema>
