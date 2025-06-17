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
}

// Get all facilities with optional filters excluding deleted by default.
// If showDeleted is true, includes deleted facilities (for admin/staff).
export async function getFacilities(
  filter: FilterQuery<FacilityDocument> = {},
  showDeleted = false
): Promise<FacilityDocument[]> {
  try {
    const queryFilter = showDeleted ? filter : { ...filter, isDeleted: false };
    return await FacilityModel.find(queryFilter).exec();
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
    throw new Error("Error creating facility");
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
export async function addAvailability(
  id: string,
  availabilityPeriod: AvailabilityPeriod,
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

// Remove an availability period by marking its isAvailable = false using day identifier
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
