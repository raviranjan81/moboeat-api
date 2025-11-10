import { ZodError } from "zod";

const formatZodErrors = (err) => {
    return err.errors.reduce((acc, curr) => {
        const field = curr.path.length > 0 ? curr.path.join('.') : 'body';
        acc[field] = curr.message;
        return acc;
    }, {});
};

export const validate = (schemas) => {
    
    return (req, res, next) => {
    
        try {
            if (schemas.body) schemas.body.parse(req.body);
            if (schemas.params) schemas.params.parse(req.params);
            if (schemas.query) schemas.query.parse(req.query);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                res.status(422).json({
                    response: false,
                    message: "Validation error",
                    errors: formatZodErrors(err),
                });
            } else {
                res.status(500).json({
                    response: false,
                    message: "Something went wrong",
                });
            }
        }
    };
};
