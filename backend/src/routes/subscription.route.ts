import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.get("/plans", SubscriptionController.getSubscriptionPlans);

// Protected routes (authentication required)
router.post(
  "/start-trial",
  AuthMiddleware,
  SubscriptionController.startFreeTrial
);

router.post(
  "/initialize-payment",
  AuthMiddleware,
  SubscriptionController.initializeSubscriptionPayment
);

router.post(
  "/verify-payment",
  AuthMiddleware,
  SubscriptionController.verifySubscriptionPayment
);

router.get(
  "/status/:companyId",
  AuthMiddleware,
  SubscriptionController.getCompanySubscriptionStatus
);

router.get(
  "/feature-access/:companyId/:feature",
  AuthMiddleware,
  SubscriptionController.checkFeatureAccess
);

router.get(
  "/usage/:companyId",
  AuthMiddleware,
  SubscriptionController.getUsageStatistics
);

router.post("/renew", AuthMiddleware, SubscriptionController.renewSubscription);

router.post(
  "/upgrade",
  AuthMiddleware,
  SubscriptionController.upgradeSubscription
);

router.delete(
  "/:companyId",
  AuthMiddleware,
  SubscriptionController.cancelSubscription
);

export default router;
