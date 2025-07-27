// src/lib/schemas/auth.schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores."
      ),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character."
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "You must enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

// --- FIX: Added the missing updateProfileSchema ---
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(50, "Name is too long."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username is too long."),
  bio: z
    .string()
    .max(160, "Bio cannot exceed 160 characters.")
    .optional()
    .nullable(),
  title: z.string().max(100, "Title is too long.").optional().nullable(),
  location: z.string().max(50, "Location is too long.").optional().nullable(),
  twitterUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  githubUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  websiteUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

// --- Export all the form value types ---
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>; // Export the new type
