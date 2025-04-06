import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Email sender schema
export const senderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export type Sender = z.infer<typeof senderSchema>;

// Email settings schema
export const emailSettingsSchema = z.object({
  tone: z.enum(["Professional", "Friendly", "Casual", "Formal"]).default("Professional"),
  customPrompt: z.string().optional(),
  size: z.enum(["Short (50-100 words)", "Medium (100-200 words)", "Long (200-300 words)", "Custom"]).default("Medium (100-200 words)"),
  customWordCount: z.number().optional().nullable(),
});

export type EmailSettings = z.infer<typeof emailSettingsSchema>;

// Lead data schema
export const leadSchema = z.object({
  name: z.string(),
  companyName: z.string(),
  productDescription: z.string().optional(),
  email: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

// Generated email schema
export const generatedEmailSchema = z.object({
  lead: leadSchema,
  subject: z.string(),
  body: z.string(),
});

export type GeneratedEmail = z.infer<typeof generatedEmailSchema>;
