import { Router } from "express";
import * as CartController from "../controllers/cart.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RequireActiveCompany } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", AuthMiddleware, CartController.list);
router.post("/add", AuthMiddleware, CartController.add);
router.post("/remove", AuthMiddleware, CartController.remove);
router.post("/clear", AuthMiddleware, CartController.clear);
router.post("/checkout", AuthMiddleware, RequireActiveCompany(), CartController.checkout);

export default router;