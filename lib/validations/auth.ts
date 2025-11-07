import { z } from "zod"

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória").min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form validation schema
export const registerSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    phone: z.string().optional(),
    companyName: z
      .string()
      .min(1, "Nome da empresa é obrigatório")
      .min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
    password: z.string().min(1, "Senha é obrigatória").min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "Senha é obrigatória").min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Accept invite form validation schema
export const acceptInviteSchema = z
  .object({
    name: z.string().optional(),
    password: z.string().min(1, "Senha é obrigatória").min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>
