import { ReviewModel, IReview } from "../models/review.model";
import { FacilityModel } from "../models/facility.model";
import mongoose from "mongoose";

const createReview = async (reviewData: Partial<IReview>): Promise<IReview> => {
  const { user, facility, rating, comment } = reviewData;

  if (!user || !facility || !rating) {
    throw new Error("User, facility, and rating are required");
  }

  // Check if user already reviewed this facility
  const existingReview = await ReviewModel.findOne({
    user: user,
    facility: facility,
  });
  if (existingReview) {
    throw new Error("User has already submitted a review for this facility.");
  }

  const newReview = new ReviewModel({
    user: user,
    facility: facility,
    rating,
    comment,
  });
  const savedReview = await newReview.save();

  // Update facility's average rating and total reviews
  await updateFacilityRating(facility);

  return savedReview;
};

const getReviewsByFacility = async (facilityId: string): Promise<IReview[]> => {
  return ReviewModel.find({ facility: facilityId }).populate("user");
};

const getReviewByUserAndFacility = async (
  userId: string,
  facilityId: string
): Promise<IReview | null> => {
  return ReviewModel.findOne({ user: userId, facility: facilityId });
};

const updateReview = async (
  reviewId: string,
  updateData: Partial<IReview>
): Promise<IReview | null> => {
  const updatedReview = await ReviewModel.findByIdAndUpdate(
    reviewId,
    updateData,
    {
      new: true,
    }
  );

  if (updatedReview) {
    await updateFacilityRating(updatedReview.facility);
  }

  return updatedReview;
};

const deleteReview = async (reviewId: string): Promise<IReview | null> => {
  const deletedReview = await ReviewModel.findByIdAndDelete(reviewId);

  if (deletedReview) {
    await updateFacilityRating(deletedReview.facility);
  }

  return deletedReview;
};

const updateFacilityRating = async (
  facilityId: mongoose.Schema.Types.ObjectId
) => {
  const reviews = await ReviewModel.find({ facility: facilityId });
  let totalRating = 0;
  reviews.forEach((review: IReview) => {
    totalRating += review.rating;
  });

  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await FacilityModel.findByIdAndUpdate(
    facilityId,
    { rating: { average: averageRating, totalReviews: reviews.length } },
    { new: true }
  );
};

export {
  createReview,
  getReviewsByFacility,
  getReviewByUserAndFacility,
  updateReview,
  deleteReview,
};
