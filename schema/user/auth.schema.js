import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .openapi({ example: "John Doe" }),

  mobile: z
    .string({ required_error: "Mobile number is required" })
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .openapi({ example: "9876543210" }),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .openapi({ example: "john@example.com" }),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .openapi({ example: "secret123" }),

  countryId: z
    .string()
    .optional()
    .openapi({ example: "6612f8b3c4e1b6c80dc4c9d1" }),

  stateId: z
    .string()
    .optional()
    .openapi({ example: "6612f8b3c4e1b6c80dc4c9d2" }),

  cityId: z
    .string()
    .optional()
    .openapi({ example: "6612f8b3c4e1b6c80dc4c9d3" }),

  corporateCode: z
    .string({ required_error: "Corporate code is required" })
    .min(2, "Corporate code must be at least 2 characters")
    .openapi({ example: "ACME123" }),

  logo: z.string().optional().openapi({ example: "uploads/users/logo.png" }),
});

export const loginSchema = z
  .object({
    mobile: z
      .string({ required_error: "Mobile number is required" })
      .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits")
      .openapi({ example: "9876543210" }),

    otp: z
      .string()
      .regex(/^[0-9]{6}$/, "OTP must be 6 digits")
      .optional()
      .openapi({ example: "123456" }),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional()
      .openapi({ example: "secret123" }),
  })
  .refine((data) => data.otp || data.password, {
    message: "Either OTP or Password is required for login",
    path: ["otp"],
  });
