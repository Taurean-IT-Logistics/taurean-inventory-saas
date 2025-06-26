import { FacilityModel, FacilityDocument } from "../models/facility.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

interface AvailabilityPeriod {
  _id: Types.ObjectId;
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  startDate?: string;
  endDate?: string;
}

interface PaginationOptions {
  skip: number;
  limit: number;
}

interface FacilitiesResult {
  facilities: FacilityDocument[];
  total: number;
}

interface ReviewsResult {
  reviews: any[];
  total: number;
}

// Get all facilities with optional filters excluding deleted by default.
// If showDeleted is true, includes deleted facilities (for admin/staff).
// Now supports pagination
export async function getFacilities(
  filter: FilterQuery<FacilityDocument> = {},
  showDeleted = false,
  pagination?: PaginationOptions
): Promise<FacilitiesResult> {
  try {
    const queryFilter = showDeleted ? filter : { ...filter, isDeleted: false };

    if (pagination) {
      const facilities = await FacilityModel.find(queryFilter)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .exec();

      const total = await FacilityModel.countDocuments(queryFilter).exec();

      return { facilities, total };
    } else {
      const facilities = await FacilityModel.find(queryFilter).exec();
      return { facilities, total: facilities.length };
    }
  } catch (error) {
    throw new Error("Error fetching facilities");
  }
}

// Get facility by ID excluding deleted by default.
// If showDeleted is true, can get soft-deleted facilities (for admin/staff).
export async function getFacilityById(
  id: string,
  showDeleted = false
): Promise<FacilityDocument | null> {
  try {
    const queryFilter = showDeleted
      ? { _id: id }
      : { _id: id, isDeleted: false };
    return await FacilityModel.findOne(queryFilter).exec();
  } catch (error) {
    throw new Error("Error fetching facility");
  }
}

// Create a new facility
export async function createFacility(
  data: Partial<FacilityDocument>
): Promise<FacilityDocument> {
  try {
    const facility = new FacilityModel(data);
    await facility.save();
    return facility;
  } catch (error) {
    throw new Error("Error creating facility" + (error as Error).message);
  }
}

// Update a facility by ID excluding deleted by default.
// If showDeleted is true, allows update on soft-deleted facilities.
export async function updateFacility(
  id: string,
  updateData: UpdateQuery<FacilityDocument>,
  showDeleted = false
): Promise<FacilityDocument> {
  try {
    const queryFilter = showDeleted
      ? { _id: id }
      : { _id: id, isDeleted: false };
    const facility = await FacilityModel.findOneAndUpdate(
      queryFilter,
      { ...updateData },
      { new: true }
    ).exec();
    if (!facility) throw new Error("Facility not found");
    return facility;
  } catch (error) {
    throw new Error("Error updating facility");
  }
}

// Soft delete facility by setting isDeleted flag
// Now accepts deletedBy parameter to track who deleted it
export async function deleteFacility(id: string): Promise<boolean> {
  try {
    const facility = await FacilityModel.findOne({
      _id: id,
      isDeleted: false,
    }).exec();
    if (!facility) throw new Error("Facility not found");

    facility.isDeleted = true;

    await facility.save();
    return true;
  } catch (error) {
    throw new Error("Error deleting facility");
  }
}

// Add availability period - excludes deleted facilities by default
// showDeleted flag optionally allows adding availability to deleted facilities
// Updated to handle both date-based and day-based availability
export async function addAvailability(
  id: string,
  availabilityPeriod: AvailabilityPeriod | any,
  showDeleted = false
): Promise<FacilityDocument> {
  try {
    const queryFilter = showDeleted
      ? { _id: id }
      : { _id: id, isDeleted: false };
    const facility = await FacilityModel.findOne(queryFilter).exec();
    if (!facility) throw new Error("Facility not found");

    facility.availability.push(availabilityPeriod);
    await facility.save();
    return facility;
  } catch (error) {
    throw new Error("Error adding availability");
  }
}

// Remove an availability period by filtering out the matching availability ID
// Excludes deleted facilities by default, showDeleted flag optionally overrides this
export async function removeAvailability(
  id: string,
  availabilityId: string,
  showDeleted = false
): Promise<FacilityDocument> {
  try {
    const queryFilter = showDeleted
      ? { _id: id }
      : { _id: id, isDeleted: false };
    const facility = await FacilityModel.findOne(queryFilter).exec();
    if (!facility) throw new Error("Facility not found");

    facility.availability = facility.availability.filter(
      (a: any) => !(a._id && a._id.toString() === availabilityId)
    );
    await facility.save();

    return facility;
  } catch (error) {
    throw new Error("Error removing availability");
  }
}

// Leave a review for a facility
// Updated to handle both new reviews and review updates
export async function leaveReview(
  facilityId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<FacilityDocument> {
  try {
    const facility = await FacilityModel.findOne({
      _id: facilityId,
      isDeleted: false,
    }).exec();
    if (!facility) throw new Error("Facility not found");

    const existingReviewIndex = facility.reviews.findIndex(
      (r: any) => r.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      facility.reviews[existingReviewIndex] = {
        ...facility.reviews[existingReviewIndex],
        rating,
        comment,
        updatedAt: new Date(),
      };
    } else {
      // Add new review
      const review = {
        user: userId,
        rating,
        comment,
        createdAt: new Date(),
      } as any;
      facility.reviews.push(review);
    }

    await facility.save();
    return facility;
  } catch (error) {
    throw new Error("Error leaving review");
  }
}

// Get facility reviews with pagination
// New function to support the controller's getFacilityReviews endpoint
export async function getFacilityReviews(
  facilityId: string,
  pagination: PaginationOptions
): Promise<ReviewsResult> {
  try {
    const facility = await FacilityModel.findOne({
      _id: facilityId,
      isDeleted: false,
    })
      .populate("reviews.user", "name email") // Populate user details
      .exec();

    if (!facility) throw new Error("Facility not found");

    const total = facility.reviews.length;
    const reviews = facility.reviews
      .slice(pagination.skip, pagination.skip + pagination.limit)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return { reviews, total };
  } catch (error) {
    throw new Error("Error fetching facility reviews");
  }
}
