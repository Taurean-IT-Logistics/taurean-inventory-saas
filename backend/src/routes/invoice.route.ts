import { Router } from "express";
import * as InvoiceController from "../controllers/invoice.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", AuthMiddleware, RequireActiveCompany(), InvoiceController.create);
router.post("/:id/pay", AuthMiddleware, RequireActiveCompany(), InvoiceController.pay);

export default router;