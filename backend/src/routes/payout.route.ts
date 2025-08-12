import { Router } from "express";
import * as PayoutController from "../controllers/payout.controller";
import { AuthMiddleware, RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.post("/request", AuthMiddleware, RequireActiveCompany(), PayoutController.requestPayout);
router.post("/:id/approve", AuthMiddleware, PayoutController.approvePayout);
router.post("/:id/process", AuthMiddleware, PayoutController.processPayout);

export default router;