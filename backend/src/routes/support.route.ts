import express from "express";
import multer from "multer";
import { SupportController } from "../controllers/support.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AuthorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/support/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and common file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, PDFs, and documents are allowed."
        )
      );
    }
  },
});

// Public routes (no authentication required)
router.post(
  "/tickets",
  AuthMiddleware,
  upload.array("attachments", 5),
  SupportController.createTicket
);

// Protected routes
router.use(AuthMiddleware);

// User routes
router.get("/tickets/user", SupportController.getUserTickets);

// Super admin routes (Taurean IT)
router.get(
  "/tickets/super-admin",
  (req, res, next) => {
    if ((req.user as any)?.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  },
  SupportController.getSuperAdminTickets
);

router.get("/tickets/:ticketId", SupportController.getTicketDetails);
router.post(
  "/tickets/:ticketId/messages",
  upload.array("attachments", 5),
  SupportController.sendMessage
);

// Staff routes (admin/staff roles)
router.get(
  "/tickets/staff",
  AuthorizeRoles("admin", "staff"),
  SupportController.getStaffTickets
);
router.put(
  "/tickets/:ticketId/status",
  AuthorizeRoles("admin", "staff"),
  SupportController.updateTicketStatus
);
router.get(
  "/staff/available",
  AuthorizeRoles("admin", "staff"),
  SupportController.getAvailableStaff
);

export default router;
