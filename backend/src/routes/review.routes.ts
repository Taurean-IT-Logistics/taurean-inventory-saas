import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import {
  createReview,
  getReviewsByFacility,
  getReviewByUserAndFacility,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";

const router = Router();

// Public routes
router.get("/facility/:facilityId", getReviewsByFacility);

// Protected routes (require authentication)
router.use(AuthMiddleware);

router.get("/user/:facilityId", getReviewByUserAndFacility);
router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
