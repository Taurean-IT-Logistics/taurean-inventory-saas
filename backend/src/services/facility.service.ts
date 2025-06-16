import { FacilityDocument, FacilityModel } from "../models/facility.model";
import { Facility } from "../types";

export async function createFacility(
  data: Facility
): Promise<FacilityDocument> {
  try {
    const facility = new FacilityModel(data);
    return await facility.save();
  } catch (error: any) {
    throw new Error(`Error creating facility: ${error.message}`);
  }
}

export async function getFacilityById(
  id: string
): Promise<FacilityDocument | null> {
  try {
    return await FacilityModel.findById(id).exec();
  } catch (error: any) {
    throw new Error(`Error fetching facility: ${error.message}`);
  }
}

export async function updateFacility(
  id: string,
  data: Partial<Facility>
): Promise<FacilityDocument | null> {
  try {
    return await FacilityModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
  } catch (error: any) {
    throw new Error(`Error updating facility: ${error.message}`);
  }
}

export async function deleteFacility(
  id: string
): Promise<FacilityDocument | null> {
  try {
    return await FacilityModel.findByIdAndDelete(id).exec();
  } catch (error: any) {
    throw new Error(`Error deleting facility: ${error.message}`);
  }
}

export async function getAllFacilities(): Promise<FacilityDocument[]> {
  try {
    return await FacilityModel.find().exec();
  } catch (error: any) {
    throw new Error(`Error fetching facilities: ${error.message}`);
  }
}

export async function getFacilityByQuery(
  query: any
): Promise<FacilityDocument[]> {
  try {
    return await FacilityModel.find(query).exec();
  } catch (error: any) {
    throw new Error(`Error fetching facilities: ${error.message}`);
  }
}
