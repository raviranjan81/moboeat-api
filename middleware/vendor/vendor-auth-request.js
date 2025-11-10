import jwt from "jsonwebtoken";
import { AppError } from "../../class/AppError.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    console.log(req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization token missing or malformed", 401));
    }
  
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        
        if (!decoded  || decoded.type == 'vendor') {
            return next(new AppError("Invalid or expired token", 403));
        }
        req.user = {
            id: decoded.id,
            mobile: decoded.mobile,
            name: decoded.name,
            email: decoded.email,
            type: decoded.type,
        };
        next();
    } catch (err) {
        return next(new AppError("Invalid or expired token", 403));
    }
};
