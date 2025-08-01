import { z } from "zod";

export const businessSchema = z.object({
  businessName: z.string().min(1, "Required"),
  businessType: z.string().min(1, "Required"),
  address1: z.string().min(1, "Required"),
  address2: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  zip: z.string().regex(/^\d{5}$/, "Zip must be 5 digits"),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  countryCode: z.string().min(1, "Required"),
  phone: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone must be (000) 000-0000"),
});
