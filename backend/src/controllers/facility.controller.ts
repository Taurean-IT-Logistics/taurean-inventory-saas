import { Request, Response } from "express";
import { FacilityService } from "../services";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils";

const getFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const showDeleted =
      req.user?.role === "admin" || req.user?.role === "staff"
        ? req.query.showDeleted === "true"
        : false;

    const filter = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    const facilities = await FacilityService.getFacilities(filter, showDeleted);
    sendSuccess(res, "Facilities fetched successfully", facilities);
  } catch (error: any) {
    sendError(res, "Failed to fetch facilities", error.message);
  }
};

const getFacilityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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
    sendError(res, "Failed to fetch facility", error.message);
  }
};

const createFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    data.createdBy = req.user?.id;

    const facility = await FacilityService.createFacility(data);
    sendSuccess(res, "Facility created successfully", facility);
  } catch (error: any) {
    sendValidationError(res, "Failed to create facility: " + error.message);
  }
};

const updateFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const showDeleted = req.user?.role === "admin";

    const updatedFacility = await FacilityService.updateFacility(
      id,
      updateData,
      showDeleted
    );
    sendSuccess(res, "Facility updated successfully", updatedFacility);
  } catch (error: any) {
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
    const success = await FacilityService.deleteFacility(id);
    if (!success) {
      sendNotFound(res, "Facility not found");
      return;
    }
    sendSuccess(res, "Facility deleted successfully");
  } catch (error: any) {
    sendError(res, "Failed to delete facility", error.message);
  }
};

const addAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const availabilityPeriod = req.body;
    const showDeleted = req.user?.role === "admin";

    const facility = await FacilityService.addAvailability(
      id,
      availabilityPeriod,
      showDeleted
    );
    sendSuccess(res, "Availability period added successfully", facility);
  } catch (error: any) {
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

export {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  addAvailability,
  removeAvailability,
};
