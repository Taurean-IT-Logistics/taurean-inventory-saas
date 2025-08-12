import { Router } from "express";
import * as PayoutController from "../controllers/payout.controller";
import { AuthMiddleware, RequireActiveCompany, RequirePermissions } from "../middlewares/auth.middleware";

const router = Router();

router.get("/balance", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["accessFinancials"]), PayoutController.companyBalance);
router.get("/platform-balance", AuthMiddleware, PayoutController.platformBalance);
router.post("/request", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["accessFinancials"]), PayoutController.requestPayout);
router.post("/:id/approve", AuthMiddleware, PayoutController.approvePayout);
router.post("/:id/process", AuthMiddleware, PayoutController.processPayout);

export default router;