import { z } from "zod";

import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
const loginWithOtpSchema = z.object({
  mobile: z.string().min(10),
  otp: z.string().length(6),
});


extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.register("LoginWithOtp", loginWithOtpSchema);

registry.registerPath({
  method: "post",
  path: "/api/admin/v1/login",
  tags: ["Admin"],
  summary: "Login with OTP",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginWithOtpSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            name: z.string(),
            mobile: z.string(),
            id: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openAPIDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "MoBoEat API Docs",
    version: "1.0.0",
  },
});
