import jwt from "jsonwebtoken";
import { AppError } from "../../class/AppError.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization token missing or malformed", 401));
    }

    const token = authHeader.split(" ")[1];

    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: decoded.id,
            mobile: decoded.mobile,
            email: decoded.email,
            name: decoded.name,
            code: decoded.code,
            role: decoded.role,
        };

        next();
    } catch (err) {

        console.log(err.message);
        
        return next(new AppError("Invalid or expired token", 403));
    }
};
