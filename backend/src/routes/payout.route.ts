import { Router } from "express";
import * as PayoutController from "../controllers/payout.controller";
import { AuthMiddleware, RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.get("/balance", AuthMiddleware, RequireActiveCompany(), PayoutController.companyBalance);
router.get("/platform-balance", AuthMiddleware, PayoutController.platformBalance);
router.post("/request", AuthMiddleware, RequireActiveCompany(), PayoutController.requestPayout);
router.post("/:id/approve", AuthMiddleware, PayoutController.approvePayout);
router.post("/:id/process", AuthMiddleware, PayoutController.processPayout);

export default router;