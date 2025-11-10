import multer from "multer";
import fs from "fs";
import path from "path";
import { AppError } from "../../class/AppError.js";
import { removeImageBackground } from "../../utils/remove-background.js";

export const ensureFolderExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

export const fileHandler = ({
    folderPath,
    fieldName = "image",
    filename,
}) => {
    const storage = multer.diskStorage({
        destination: (req, _, cb) => {
            const resolvedFolderPath = typeof folderPath === "function" ? folderPath(req) : folderPath;
            ensureFolderExists(resolvedFolderPath);
            cb(null, resolvedFolderPath);
        },
        filename: (req, file, cb) => {
            const timestamp = filename ?? new Date().toISOString().replace(/[-:.TZ]/g, "");
            const extension = path.extname(file.originalname);
            const name = req.body?.name || "";
            let safeName = '';
            if (filename || !name) {
                safeName = `${timestamp}${extension}`;
            } else {
                safeName = `${timestamp}-${name.replace(/\s+/g, "_").toLowerCase()}${extension}`;
            }
            cb(null, safeName);
        },
    });

    const fileFilter = (_, file, cb) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError("Invalid file type. Allowed: jpg, png, webp", 400));
        }
    };

    const uploadMiddleware = multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, 
    }).single(fieldName);

    return (req, res, next) => {
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return next(new AppError(err.message || "File upload error", 400));
            }
            if (!req.file) return next();

            req.cleanupFilePath = req.file.path;
            const shouldRemoveBg = req.body?.removeBg === "true";
            if (!shouldRemoveBg) return next();

            try {
                const originalPath = req.file.path;
                await removeImageBackground(originalPath);
                next();
            } catch (error) {
                next();
            }
        });
    };
};

export const cleanupUploadedFile = (req, res, next) => {
    console.log(req.body);
    
    res.on("finish", () => {
        const requestFailed = res.statusCode >= 400;
        if (requestFailed && req.cleanupFilePath && fs.existsSync(req.cleanupFilePath)) {
            fs.unlink(req.cleanupFilePath, () => {});
        }
    });
    next();
};
