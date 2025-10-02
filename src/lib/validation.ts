import { z } from 'zod';

// Redis connection validation
export const redisConnectionSchema = z.object({
  connectionString: z.string()
    .trim()
    .min(1, 'Connection string is required')
    .max(500, 'Connection string is too long')
    .refine(
      (val) => val.startsWith('redis-cli'),
      'Connection string must start with redis-cli'
    )
    .refine(
      (val) => {
        // Basic validation for redis-cli format
        const hasHost = val.includes('-h');
        const hasPort = val.includes('-p');
        return hasHost && hasPort;
      },
      'Connection string must include host (-h) and port (-p) parameters'
    ),
  serverName: z.string()
    .trim()
    .max(100, 'Server name must be less than 100 characters')
    .optional()
});

// Authentication validation
export const emailSchema = z.string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Sanitization helpers
export const sanitizeConnectionString = (input: string): string => {
  // Remove any potentially dangerous characters while preserving valid redis-cli syntax
  return input
    .replace(/[;&|<>$`]/g, '') // Remove shell injection characters
    .trim()
    .slice(0, 500); // Enforce max length
};

export const sanitizeServerName = (input: string): string => {
  // Remove HTML and script tags, keep only safe characters
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100);
};
