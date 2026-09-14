import { z } from 'zod';

// Mirrors backend/src/auth/dto/register.dto.ts exactly, so a form error
// surfaces on-device before a request is even sent, not just after the
// server rejects it.
const email = z.string().min(1, 'Email is required').email('Enter a valid email address');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(72, 'Password must be at most 72 characters long')
  .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number');

export const registerSchema = z.object({
  email,
  password,
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
