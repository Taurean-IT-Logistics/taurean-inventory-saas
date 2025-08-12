import { Router } from "express";
import * as TaxScheduleController from "../controllers/taxSchedule.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", AuthMiddleware, TaxScheduleController.list);
router.post("/", AuthMiddleware, TaxScheduleController.create);
router.put("/:id", AuthMiddleware, TaxScheduleController.update);
router.delete("/:id", AuthMiddleware, TaxScheduleController.remove);

export default router;