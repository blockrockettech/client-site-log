import { z } from "zod";
import { Database } from "@/integrations/supabase/types";

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  role: z.enum(["admin", "staff", "client"]).optional().default("client"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Site management schemas
export const siteSchema = z.object({
  site_name: z.string().min(1, "Site name is required")
    .max(100, "Site name must be less than 100 characters"),
  site_address: z.string().min(1, "Site address is required")
    .max(200, "Site address must be less than 200 characters"),
  profile_id: z.string().uuid("Please select a valid client"),
  visit_day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"], {
    errorMap: () => ({ message: "Please select a valid visit day" })
  }),
  visit_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 
    "Please enter a valid time in HH:MM format"),
});

// Visit management schemas
export const visitSchema = z.object({
  site_id: z.number().positive("Please select a valid site"),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 
    "Please enter a valid date"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

// Checklist item schema
export const checklistItemSchema = z.object({
  text: z.string().min(1, "Checklist item text is required")
    .max(200, "Checklist item text must be less than 200 characters"),
  completed: z.boolean().default(false),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

// Checklist schema
export const checklistSchema = z.object({
  title: z.string().min(1, "Checklist title is required")
    .max(100, "Checklist title must be less than 100 characters"),
  items: z.array(checklistItemSchema).min(1, "At least one checklist item is required"),
  site_id: z.number().positive("Please select a valid site"),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name must be less than 100 characters"),
  role: z.enum(["admin", "staff", "client"]).optional(),
});

// Type exports for use in components
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;
export type ChecklistFormData = z.infer<typeof checklistSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
