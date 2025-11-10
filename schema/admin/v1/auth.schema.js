import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);
export const loginWithOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile must be exactly 10 digits")
    .openapi({ example: "8651384873", description: "User mobile number" }),
  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
    .openapi({ example: "123456", description: "One-time password" }),
});
export const sendOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Phone must contain exactly 10 digits")
    .openapi({ example: "8651384873", description: "Mobile number to send OTP" }),
});



export const registerAdminSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .openapi({ example: "Ravi Doe", description: "Admin full name" }),

  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .openapi({ example: "ravi@example.com", description: "Admin email" }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .openapi({ example: "securePass123", description: "Password" }),

  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile must contain exactly 10 digits")
    .min(1, "Mobile is required")
    .openapi({ example: "8651384873", description: "Admin mobile number" }),

  type: z
    .enum(["superAdmin", "adminHead", "admin"])
    .openapi({ example: "admin", description: "Admin type" }),

  address: z
    .string()
    .optional()
    .nullable()
    .openapi({ example: "123 Admin Street, City", description: "Admin address (optional)" }),
 contactPerson: z.string().min(2).max(100).openapi({ example: "John Doe" }),
 
});

// ----------------------
// Update Admin Profile
// ----------------------
export const updateAdminProfileSchema = z.object({
  name: z.string().optional().openapi({ example: "Ravi Doe", description: "New name for admin" }),
  mobile: z.string().optional().openapi({ example: "8651384873", description: "New mobile number" }),
  email: z.string().optional().openapi({ example: "ravi@example.com", description: "New email address" }),
});
