import { z } from "zod"
import { emailSchema } from "./common"

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
})

export type LoginFormData = z.infer<typeof loginSchema>