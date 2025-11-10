import multer from "multer";
import fs from "fs";
import path from "path";
import { AppError } from "../../class/AppError.js";

export const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const excelFileHandler = ({
  folderPath,
  fieldName = "file",
  filename,
}) => {
  const storage = multer.diskStorage({
    destination: (req, _, cb) => {
      const resolvedFolderPath =
        typeof folderPath === "function" ? folderPath(req) : folderPath;
      ensureFolderExists(resolvedFolderPath);
      cb(null, resolvedFolderPath);
    },

    filename: (req, file, cb) => {
      const timestamp =
        filename ?? new Date().toISOString().replace(/[-:.TZ]/g, "");
      const extension = path.extname(file.originalname).toLowerCase();
      const name = req.body?.name || "excel_import";

      let safeName = "";
      if (filename || !name) {
        safeName = `${timestamp}${extension}`;
      } else {
        safeName = `${timestamp}-${name
          .replace(/\s+/g, "_")
          .toLowerCase()}${extension}`;
      }

      cb(null, safeName);
    },
  });

  const fileFilter = (_, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type. Allowed: .xls, .xlsx only", 400));
    }
  };

  const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single(fieldName);

  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message || "Excel upload error", 400));
      }

      if (!req.file) return next();
      req.cleanupFilePath = req.file.path;
      req.file.publicUrl = `public/uploads/excel/${req.file.filename}`;

      next();
    });
  };
};

/**
 * Cleanup uploaded Excel file if request fails
 */
export const cleanupExcelFile = (req, res, next) => {
  res.on("finish", () => {
    const requestFailed = res.statusCode >= 400;
    if (
      requestFailed &&
      req.cleanupFilePath &&
      fs.existsSync(req.cleanupFilePath)
    ) {
      fs.unlink(req.cleanupFilePath, () => {});
    }
  });
  next();
};
