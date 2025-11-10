import { commonErrorResponseSchema } from "./common.error.schema.js";

export const getResponseSchema = ({
    response = false,
    statusCode,
    message = null,
    data = null,
}) => {
    return {
        [statusCode]: {
            description: message || undefined,
            content: {
                "application/json": {
                    schema: commonErrorResponseSchema,
                    example: {
                        response,
                        ...(message !== null ? { message } : {}), 
                        ...(data !== null ? { data } : {}),
                    },
                },
            },
        },
    };
};
