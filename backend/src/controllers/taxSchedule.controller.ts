import { Request, Response } from "express";
import { TaxScheduleModel } from "../models/taxSchedule.model";
import { sendSuccess, sendError } from "../utils";

export async function create(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const doc = await TaxScheduleModel.create(req.body);
    return sendSuccess(res, "Tax schedule created", { schedule: doc }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to create schedule", e.message);
  }
}

export async function list(req: Request, res: Response) {
  try {
    const docs = await TaxScheduleModel.find().sort({ startDate: -1 });
    return sendSuccess(res, "Tax schedules", { schedules: docs });
  } catch (e: any) {
    return sendError(res, "Failed to list schedules", e.message);
  }
}

export async function update(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const { id } = req.params;
    const doc = await TaxScheduleModel.findByIdAndUpdate(id, req.body, { new: true });
    return sendSuccess(res, "Tax schedule updated", { schedule: doc });
  } catch (e: any) {
    return sendError(res, "Failed to update schedule", e.message);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const { id } = req.params;
    await TaxScheduleModel.findByIdAndDelete(id);
    return sendSuccess(res, "Tax schedule deleted", {});
  } catch (e: any) {
    return sendError(res, "Failed to delete schedule", e.message);
  }
}