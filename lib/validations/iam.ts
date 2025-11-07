import { z } from "zod"

export const createInvitationSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  name: z.string().optional(),
  role: z.enum(["admin", "manager", "employee"]).optional(),
  positionId: z.string().optional(),
})

export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>
