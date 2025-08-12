import { Router } from "express";
import * as DeletionController from "../controllers/deletionRequest.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/company", AuthMiddleware, DeletionController.queueCompanyDeletion);
router.post("/user", AuthMiddleware, DeletionController.queueUserDeletion);
router.post("/:id/cancel", AuthMiddleware, DeletionController.cancelDeletion);

export default router;