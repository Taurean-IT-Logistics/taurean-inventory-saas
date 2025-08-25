import { Router } from "express";
import * as PayoutController from "../controllers/payout.controller";
import {
  AuthMiddleware,
  RequireActiveCompany,
  RequirePermissions,
} from "../middlewares/auth.middleware";

const router = Router();

router.post("/:id/approve", AuthMiddleware, PayoutController.approvePayout);
router.post("/:id/process", AuthMiddleware, PayoutController.processPayout);

export default router;
