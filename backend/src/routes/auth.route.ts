import { Router } from "express";
import { AuthController } from "../controllers";
import { AuthMiddleware, AuthRateLimiter } from "../middlewares";

const router = Router();

// Public routes
router.post("/login", AuthRateLimiter, AuthController.login);

router.post("/register", AuthRateLimiter, AuthController.register);

router.post("/refresh", AuthRateLimiter, AuthController.refreshToken);

// Protected routes
router.get("/profile", AuthMiddleware, AuthController.getProfile);

router.put("/profile", AuthMiddleware, AuthController.updateProfile);

export default router;
