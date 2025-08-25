import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";
import { sendSuccess, sendError } from "../utils/response.util";
import mongoose from "mongoose";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { facilityId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    if (!facilityId || !rating) {
      return sendError(res, "Facility ID and rating are required", 400);
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    const review = await ReviewService.createReview({
      user: userId as any,
      facility: facilityId as any,
      rating,
      comment: comment || "",
    });

    sendSuccess(res, "Review created successfully", review, 201);
  } catch (error: any) {
    if (error.message === "User has already submitted a review for this facility.") {
      return sendError(res, error.message, 409);
    }
    sendError(res, error.message || "Failed to create review", 500);
  }
};

export const getReviewsByFacility = async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.params;
    const reviews = await ReviewService.getReviewsByFacility(facilityId);
    sendSuccess(res, "Reviews retrieved successfully", reviews);
  } catch (error: any) {
    sendError(res, error.message || "Failed to retrieve reviews", 500);
  }
};

export const getReviewByUserAndFacility = async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const review = await ReviewService.getReviewByUserAndFacility(userId, facilityId);
    sendSuccess(res, "Review retrieved successfully", review);
  } catch (error: any) {
    sendError(res, error.message || "Failed to retrieve review", 500);
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    if (rating && (rating < 1 || rating > 5)) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    const review = await ReviewService.updateReview(reviewId, {
      rating,
      comment,
    });

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    sendSuccess(res, "Review updated successfully", review);
  } catch (error: any) {
    sendError(res, error.message || "Failed to update review", 500);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const review = await ReviewService.deleteReview(reviewId);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    sendSuccess(res, "Review deleted successfully", review);
  } catch (error: any) {
    sendError(res, error.message || "Failed to delete review", 500);
  }
};
