import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { FacilityService } from "../services";
import { FacilityModel } from "../models";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";

interface MulterFile {
  path?: string;
  filename?: string;
  originalname: string;
  mimetype: string;
  size: number;
}

const getFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;

    // Use aggregation to filter by company subscription status
    const facilities = await FacilityModel.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $match: {
          isDeleted: showDeleted ? { $in: [true, false] } : false,
          "company.isActive": true,
          $or: [
            { "company.subscription.expiresAt": { $gt: new Date() } },
            { "company.name": "Taurean IT" }, // Taurean IT is always active
          ],
        },
      },
    ]);

    // Add pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = facilities.length;
    const paginatedFacilities = facilities.slice(skip, skip + limit);

    sendSuccess(res, "Facilities fetched successfully", {
      facilities: paginatedFacilities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching facilities:", error);
    sendError(res, "Failed to fetch facilities", error.message);
  }
};

const getCompanyFacilities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;

    // Enhanced filter parsing with validation
    let filter = { company: req.user?.companyId };
    if (req.query.filter) {
      try {
        const queryFilter = JSON.parse(req.query.filter as string);
        filter = { ...filter, ...queryFilter };
      } catch (parseError) {
        sendValidationError(res, "Invalid filter format. Must be valid JSON.");
        return;
      }
    }

    // Add pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const result = await FacilityService.getFacilities(filter, showDeleted, {
      skip,
      limit,
    });

    sendSuccess(res, "Company facilities fetched successfully", {
      facilities: result.facilities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching company facilities:", error);
    sendError(res, "Failed to fetch company facilities", error.message);
  }
};

const getFacilityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId format using MongoDB's built-in function
    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;

    const facility = await FacilityService.getFacilityById(id, showDeleted);
    if (!facility) {
      sendNotFound(res, "Facility not found");
      return;
    }
    sendSuccess(res, "Facility fetched successfully", facility);
  } catch (error: any) {
    console.error("Error fetching facility by ID:", error);
    sendError(res, "Failed to fetch facility", error.message);
  }
};

const createFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Input validation
    if (!data.name || !data.location) {
      sendValidationError(res, "Name and location are required fields");
      return;
    }

    // Enhanced file handling with validation
    if (req.files && Array.isArray(req.files)) {
      // Validate file sizes and types
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = req.files.filter(
        (file: MulterFile) => file.size > maxFileSize
      );

      if (invalidFiles.length > 0) {
        sendValidationError(res, "Some files exceed the 10MB size limit");
        return;
      }

      data.images = req.files.map((file: MulterFile) => ({
        path: file.path || file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));
    } else if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        sendValidationError(res, "File exceeds the 10MB size limit");
        return;
      }

      data.images = [
        {
          path: req.file.path || req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      ];
    }

    // Add creator information and ensure company is only the ID
    data.createdBy = req.user?.id;
    data.company = req.user?.companyId;

    const facility = await FacilityService.createFacility(data);
    sendSuccess(res, "Facility created successfully", facility);
  } catch (error: any) {
    console.error("Error creating facility:", error);
    sendValidationError(res, "Failed to create facility: " + error.message);
  }
};

const updateFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    const updateData = { ...req.body };
    const showDeleted = req.user?.role === "admin";

    // Extract image operation parameters
    const removeImageIds = req.body.removeImageIds;
    const replaceAllImages = req.body.replaceAllImages === "true";

    // Clean up image-related fields from updateData
    delete updateData.removeImageIds;
    delete updateData.replaceAllImages;

    let newImages: any[] = [];

    // Enhanced file handling for updates
    if (req.files && Array.isArray(req.files)) {
      // Validate file sizes
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = req.files.filter(
        (file: MulterFile) => file.size > maxFileSize
      );

      if (invalidFiles.length > 0) {
        sendValidationError(res, "Some files exceed the 10MB size limit");
        return;
      }

      newImages = req.files.map((file: MulterFile) => ({
        path: file.path || file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
    } else if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        sendValidationError(res, "File exceeds the 10MB size limit");
        return;
      }

      newImages = [
        {
          path: req.file.path || req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date(),
        },
      ];
    }

    updateData.updatedBy = req.user?.id;
    updateData.updatedAt = new Date();

    const updatedFacility = await FacilityService.updateFacility(
      id,
      updateData,
      newImages.length > 0 ? newImages : undefined,
      removeImageIds,
      replaceAllImages,
      showDeleted
    );
    sendSuccess(res, "Facility updated successfully", updatedFacility);
  } catch (error: any) {
    console.error("Error updating facility:", error);
    if (error.message === "Facility not found") {
      sendNotFound(res, error.message);
      return;
    }
    sendValidationError(res, "Failed to update facility: " + error.message);
  }
};

const deleteFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    const success = await FacilityService.deleteFacility(id);
    if (!success) {
      sendNotFound(res, "Facility not found");
      return;
    }
    sendSuccess(res, "Facility deleted successfully");
  } catch (error: any) {
    console.error("Error deleting facility:", error);
    sendError(res, "Failed to delete facility", error.message);
  }
};

const addAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    const availabilityPeriod = req.body;

    // Validate availability period structure
    if (!availabilityPeriod.startDate || !availabilityPeriod.endDate) {
      sendValidationError(res, "Start date and end date are required");
      return;
    }

    // Validate date format and logic
    const startDate = new Date(availabilityPeriod.startDate);
    const endDate = new Date(availabilityPeriod.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      sendValidationError(res, "Invalid date format");
      return;
    }

    if (startDate >= endDate) {
      sendValidationError(res, "Start date must be before end date");
      return;
    }

    const showDeleted = req.user?.role === "admin";

    const facility = await FacilityService.addAvailability(
      id,
      availabilityPeriod,
      showDeleted
    );
    sendSuccess(res, "Availability period added successfully", facility);
  } catch (error: any) {
    console.error("Error adding availability:", error);
    if (error.message === "Facility not found") {
      sendNotFound(res, error.message);
      return;
    }
    sendValidationError(
      res,
      "Failed to add availability period: " + error.message
    );
  }
};

const removeAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { dayId } = req.body;

    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    if (!dayId) {
      sendValidationError(res, "Invalid or missing dayId in request body");
      return;
    }

    const showDeleted = req.user?.role === "admin";

    const facility = await FacilityService.removeAvailability(
      id,
      dayId,
      showDeleted
    );
    sendSuccess(
      res,
      "Availability period marked unavailable successfully",
      facility
    );
  } catch (error: any) {
    console.error("Error removing availability:", error);
    if (error.message === "Facility not found") {
      sendNotFound(res, error.message);
      return;
    }
    sendValidationError(
      res,
      "Failed to remove availability period: " + error.message
    );
  }
};

const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const facilityId = req.params.id;
    const { rating, comment } = req.body;

    if (!isValidObjectId(facilityId)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    if (!rating || !comment) {
      sendValidationError(res, "Rating and comment are required");
      return;
    }

    // Validate rating range
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      sendValidationError(res, "Rating must be a number between 1 and 5");
      return;
    }

    // Validate comment length
    if (comment.length < 10 || comment.length > 500) {
      sendValidationError(res, "Comment must be between 10 and 500 characters");
      return;
    }

    if (!req.user || !req.user.id) {
      sendValidationError(res, "User information is missing");
      return;
    }

    const userId = req.user.id;

    const facility = await FacilityService.leaveReview(
      facilityId,
      userId,
      numericRating,
      comment
    );
    sendSuccess(res, "Review added successfully", facility);
  } catch (error: any) {
    console.error("Error adding review:", error);
    if (error.message === "Facility not found") {
      sendNotFound(res, error.message);
      return;
    }
    if (error.message === "User has already reviewed this facility") {
      sendValidationError(res, error.message);
      return;
    }
    sendValidationError(res, "Failed to add review: " + error.message);
  }
};

// New function to get facility reviews with pagination
const getFacilityReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendValidationError(res, "Invalid facility ID format");
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const result = await FacilityService.getFacilityReviews(id, {
      skip,
      limit,
    });

    sendSuccess(res, "Reviews fetched successfully", {
      reviews: result.reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching facility reviews:", error);
    sendError(res, "Failed to fetch reviews", error.message);
  }
};

export {
  getFacilities,
  getCompanyFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  addAvailability,
  removeAvailability,
  addReview,
  getFacilityReviews,
};
