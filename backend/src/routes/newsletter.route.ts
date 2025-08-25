import { Router } from "express";
import { unsubscribe, resubscribe, verifyUnsubscribe } from "../controllers/newsletter.controller";

const router = Router();

// Public routes (no authentication required)
router.post("/unsubscribe", unsubscribe);
router.post("/resubscribe", resubscribe);
router.get("/unsubscribe/:token", verifyUnsubscribe);

export default router;