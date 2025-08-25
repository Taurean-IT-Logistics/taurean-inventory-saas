import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = "uploads/";

    // More flexible path handling
    switch (req.baseUrl) {
      case "/api/v1/facilities":
        uploadPath = path.join(uploadPath, "facilities");
        break;
      case "/api/v1/users":
        uploadPath = path.join(uploadPath, "users");
        break;
      case "/api/v1/inventory-items":
        uploadPath = path.join(uploadPath, "inventory");
        break;
      case "/api/v1/companies":
        uploadPath = path.join(uploadPath, "companies");
        break;
      case "/api/v1/company":
        uploadPath = path.join(uploadPath, "company");
        break;
      case "/api/v1/support":
        uploadPath = path.join(uploadPath, "support");
        break;
      default:
        uploadPath = path.join(uploadPath, "general");
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedOriginalName = file.originalname.replace(
      /[^a-zA-Z0-9.-]/g,
      ""
    );

    let prefix = "file";
    if (req.baseUrl === "/api/v1/facilities") {
      prefix = "facility";
    } else if (req.baseUrl === "/api/v1/users") {
      prefix = "user";
    } else if (req.baseUrl === "/api/v1/inventory-items") {
      prefix = "inventory";
    } else if (req.baseUrl === "/api/v1/companies") {
      prefix = "company";
    } else if (req.baseUrl === "/api/v1/support") {
      prefix = "support";
    } else if (req.baseUrl === "/api/v1/company") {
      prefix = "company";
    }

    const extension = path.extname(sanitizedOriginalName);
    const baseName = path.basename(sanitizedOriginalName, extension);

    cb(null, `${prefix}-${uniqueSuffix}-${baseName}${extension}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${
          file.mimetype
        }. Allowed types: ${allowedTypes.join(", ")}`
      )
    );
  }
};

// Enhanced upload configuration with size limits
export { storage, fileFilter };
