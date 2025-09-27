import { Router } from "express";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";
import {
  uploadDocumentController,
  getDocumentsController,
  getDocumentByIdController,
  updateDocumentController,
  deleteDocumentController,
  getDocumentStatisticsController,
  getDocumentPreviewController,
  downloadDocumentController,
} from "../controllers/documentManagement.controller";
import { upload } from "../services/documentManagement.service";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];

// Document upload
router.post(
  "/upload",
  staffAndAbove,
  RequireActiveCompany(),
  upload.single("file"),
  uploadDocumentController
);

// Document CRUD operations
router.get(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  getDocumentsController
);

router.get(
  "/statistics",
  staffAndAbove,
  RequireActiveCompany(),
  getDocumentStatisticsController
);

router.get(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  getDocumentByIdController
);

router.put(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  updateDocumentController
);

router.delete(
  "/:id",
  adminOnly,
  RequireActiveCompany(),
  deleteDocumentController
);

// Document actions
router.get(
  "/:id/preview",
  staffAndAbove,
  RequireActiveCompany(),
  getDocumentPreviewController
);

router.get(
  "/:id/download",
  staffAndAbove,
  RequireActiveCompany(),
  downloadDocumentController
);

export default router;