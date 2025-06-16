import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { AuthMiddleware, AuthRateLimiter } from "../middlewares";

const router = Router();

// Public routes
router.post("/login", AuthRateLimiter, AuthController.login);
router.post("/register", AuthRateLimiter, AuthController.register);
router.post("/refresh", AuthRateLimiter, AuthController.refreshToken);
router.post("/forgot-password", AuthRateLimiter, AuthController.forgotPassword);
router.post("/reset-password", AuthRateLimiter, AuthController.resetPassword);
router.post("/verify-email", AuthRateLimiter, AuthController.verifyEmail);

// Protected routes
router.get("/profile", AuthMiddleware, AuthController.getProfile);
router.put("/profile", AuthMiddleware, AuthController.updateProfile);
router.post("/logout", AuthMiddleware, AuthController.logout);
router.post("/change-password", AuthMiddleware, AuthController.changePassword);

export default router;
