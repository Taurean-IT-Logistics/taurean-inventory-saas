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
import {
  getDocumentsForReviewController,
  reviewDocumentController,
  getDocumentReviewStatisticsController,
  getCompanyDocumentsController,
  getDocumentForReviewController,
  downloadDocumentForReviewController,
  bulkReviewDocumentsController,
} from "../controllers/superAdminDocumentReview.controller";
import { upload } from "../services/documentManagement.service";

const router: Router = Router();

const adminOnly = [AuthMiddleware, AuthorizeRoles("admin")];
const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [AuthMiddleware];
const superAdminOnly = [AuthMiddleware, AuthorizeRoles("super_admin")];

// Document upload
router.post(
  "/upload",
  staffAndAbove,
  RequireActiveCompany(),
  upload.single("file"),
  uploadDocumentController
);

// Document CRUD operations
router.get("/", staffAndAbove, RequireActiveCompany(), getDocumentsController);

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

// Super Admin Document Review Routes
router.get(
  "/super-admin/review",
  superAdminOnly,
  getDocumentsForReviewController
);

router.get(
  "/super-admin/statistics",
  superAdminOnly,
  getDocumentReviewStatisticsController
);

router.get(
  "/super-admin/company/:companyId",
  superAdminOnly,
  getCompanyDocumentsController
);

router.get("/super-admin/:id", superAdminOnly, getDocumentForReviewController);

router.get(
  "/super-admin/:id/download",
  superAdminOnly,
  downloadDocumentForReviewController
);

router.post(
  "/super-admin/:id/review",
  superAdminOnly,
  reviewDocumentController
);

router.post(
  "/super-admin/bulk-review",
  superAdminOnly,
  bulkReviewDocumentsController
);

export default router;
