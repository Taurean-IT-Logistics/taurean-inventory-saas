import { Router } from "express";
import * as CashflowController from "../controllers/cashflow.controller";
import { AuthMiddleware, RequireActiveCompany, RequirePermissions } from "../middlewares/auth.middleware";

const router = Router();

router.get("/summary", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["accessFinancials"]), CashflowController.summary);
router.get("/anomalies", AuthMiddleware, RequireActiveCompany(), RequirePermissions(["accessFinancials"]), CashflowController.anomalies);

export default router;