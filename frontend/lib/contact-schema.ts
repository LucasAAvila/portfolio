import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "nameTooShort" }).max(100, { message: "nameTooLong" }),
  email: z.email({ message: "invalidEmail" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "messageTooShort" })
    .max(2000, { message: "messageTooLong" }),
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
