import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const paramIdSchema = z.object({
    id: z.string().openapi({ param: { name: "id", in: "path" } }),
});
export const createPathParamSchema = (paramName) => {
    return z.object({
        [paramName]: z.string().openapi({
            param: {
                name: paramName,
                in: "path",
            },
        }),
    });
};