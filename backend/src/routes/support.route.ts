import express from "express";
import multer from "multer";
import { SupportController } from "../controllers/support.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
} from "../middlewares/auth.middleware";
import { AuthorizeRoles } from "../middlewares/auth.middleware";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../../uploads/support");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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

// Protected routes - all routes require authentication
router.use(AuthMiddleware);

// Create new ticket (with file upload support)
router.post(
  "/tickets",
  upload.array("attachments", 5),
  SupportController.createTicket
);

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

// Staff routes (admin/staff roles)
router.get(
  "/tickets/staff",
  AuthorizeRoles("admin", "staff"),
  RequireActiveCompany(),
  SupportController.getStaffTickets
);

router.get("/tickets/:ticketId", SupportController.getTicketDetails);

// Get ticket messages
router.get("/tickets/:ticketId/messages", SupportController.getTicketMessages);

router.post(
  "/tickets/:ticketId/messages",
  upload.array("attachments", 5),
  SupportController.sendMessage
);

// Typing indicator route
router.post("/tickets/:ticketId/typing", SupportController.updateTypingStatus);

// Close ticket (users can close their own tickets, staff can close any)
router.put("/tickets/:ticketId/close", SupportController.closeTicket);

// Reopen ticket (users can reopen their own tickets, staff can reopen any)
router.put("/tickets/:ticketId/reopen", SupportController.reopenTicket);

// Update ticket status (staff only)
router.put(
  "/tickets/:ticketId/status",
  AuthorizeRoles("admin", "staff"),
  RequireActiveCompany(),
  SupportController.updateTicketStatus
);

// Assign ticket to staff member
router.put(
  "/tickets/:ticketId/assign",
  RequireActiveCompany(),
  AuthorizeRoles("admin", "staff"),
  SupportController.assignTicket
);

// Reassign ticket to another staff member
router.put(
  "/tickets/:ticketId/reassign",
  AuthorizeRoles("admin", "staff"),
  RequireActiveCompany(),
  SupportController.reassignTicket
);

router.get(
  "/staff/available",
  AuthorizeRoles("admin", "staff"),
  RequireActiveCompany(),
  SupportController.getAvailableStaff
);

// Support statistics and metadata
router.get("/stats", SupportController.getSupportStats);
router.get("/categories", SupportController.getSupportCategories);
router.get("/priorities", SupportController.getSupportPriorities);

export default router;
