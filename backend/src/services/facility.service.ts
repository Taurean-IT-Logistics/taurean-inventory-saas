import { FacilityModel, FacilityDocument } from "../models/facility.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { Facility } from "../types";

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

const updateRatings = async (
  facilityId: string
): Promise<FacilityDocument | null> => {
  try {
    const facility = await FacilityModel.findById(facilityId);

    if (!facility) {
      return null;
    }

    const reviews = facility.reviews;
    const totalReviews = reviews.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
    }

    const updatedFacility = await FacilityModel.findByIdAndUpdate(
      facilityId,
      {
        $set: {
          "rating.average": averageRating,
          "rating.totalReviews": totalReviews,
        },
      },
      { new: true }
    );

    return updatedFacility;
  } catch (error) {
    throw error;
  }
};

// Get all facilities with optional filters excluding deleted by default.
// If showDeleted is true, includes deleted facilities (for admin/staff).
// Now supports pagination
export async function getFacilities(
  filter: FilterQuery<FacilityDocument> = {},
  showDeleted = false,
  pagination?: PaginationOptions
): Promise<FacilitiesResult> {
  try {
    const queryFilter = showDeleted ? filter : { ...filter };

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
    const facility = await FacilityModel.findOne(queryFilter).exec();

    if (facility) {
      const updatedFacility = await updateRatings(id);
      return updatedFacility;
    }

    return facility;
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
  updateData: Partial<Facility>,
  newImages?: any[],
  removeImageIds?: string[],
  replaceAllImages = false,
  showDeleted = false
): Promise<FacilityDocument | null> {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    const filter = showDeleted ? { _id: id } : { _id: id, isDeleted: false };

    if (newImages?.length || removeImageIds?.length || replaceAllImages) {
      const currentItem = await FacilityModel.findOne(filter);
      if (!currentItem) {
        throw new Error("Inventory item not found");
      }

      let updatedImages = [...(currentItem.images || [])];

      // Remove specified images
      if (removeImageIds?.length) {
        updatedImages = updatedImages.filter(
          (img: any) => !removeImageIds.includes(img._id?.toString())
        );
      }

      // Handle new images
      if (newImages?.length) {
        if (replaceAllImages) {
          updatedImages = newImages;
        } else {
          updatedImages = [...updatedImages, ...newImages];
        }
      }

      updateData.images = updatedImages;
    }

    return await FacilityModel.findOneAndUpdate(filter, updateData, {
      new: true,
    });
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
    }).exec();
    if (!facility) throw new Error("Facility not found");

    facility.isDeleted = !facility.isDeleted;

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
    // First try to update existing review
    const updatedFacility = await FacilityModel.findOneAndUpdate(
      {
        _id: facilityId,
        isDeleted: false,
        "reviews.user": userId,
      },
      {
        $set: {
          "reviews.$.rating": rating,
          "reviews.$.comment": comment,
          "reviews.$.updatedAt": new Date(),
          "reviews.$.isVerified": false,
        },
      },
      { new: true }
    ).exec();

    if (updatedFacility) {
      const facilityWithUpdatedRatings = await updateRatings(facilityId);
      return facilityWithUpdatedRatings!; // Non-null assertion since we know facility exists
    }

    // If no existing review found, add new one
    const facilityWithNewReview = await FacilityModel.findOneAndUpdate(
      {
        _id: facilityId,
        isDeleted: false,
      },
      {
        $push: {
          reviews: {
            user: new Types.ObjectId(userId),
            rating,
            comment,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();

    if (!facilityWithNewReview) {
      throw new Error("Facility not found");
    }

    const finalFacility = await updateRatings(facilityId);
    return finalFacility!; // Non-null assertion since we know facility exists
  } catch (error) {
    console.error("Error leaving review:", error);
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
    // First, let's debug what we have
    const facilityCheck = await FacilityModel.findById(facilityId);
    if (!facilityCheck) {
      throw new Error("Facility not found");
    }
    const result = await FacilityModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(facilityId),
        },
      },
      {
        $unwind: "$reviews",
      },
      // Add debugging stage
      {
        $addFields: {
          "reviews.userIdCheck": "$reviews.user",
        },
      },
      {
        $lookup: {
          from: "users", // Try "users" first, might need to be different
          localField: "reviews.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Add debugging to see lookup result
      {
        $addFields: {
          "reviews.lookupResult": "$userDetails",
          "reviews.user": {
            $cond: {
              if: { $gt: [{ $size: "$userDetails" }, 0] },
              then: { $arrayElemAt: ["$userDetails", 0] },
              else: "$reviews.user", // Keep original if lookup fails
            },
          },
        },
      },
      {
        $sort: {
          "reviews.createdAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          reviews: {
            $push: "$reviews",
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          reviews: {
            $slice: ["$reviews", pagination.skip, pagination.limit],
          },
          total: 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        reviews: [],
        total: 0,
      };
    }

    return {
      reviews: result[0].reviews || [],
      total: result[0].total || 0,
    };
  } catch (error) {
    console.error("Error fetching facility reviews:", error);
    throw new Error("Error fetching facility reviews");
  }
}
