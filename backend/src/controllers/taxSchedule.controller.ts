import { Request, Response } from "express";
import { TaxScheduleModel } from "../models/taxSchedule.model";
import { sendSuccess, sendError } from "../utils";

export async function create(req: Request, res: Response) {
  try {
    // Get company ID from user - extract ObjectId if it's a populated object
    let companyId = (req.user as any)?.companyId;
    const isSuperAdmin = (req.user as any)?.isSuperAdmin;

    // Handle case where companyId might be a populated object
    if (companyId && typeof companyId === "object") {
      companyId = companyId._id || companyId.id;
    }

    if (!companyId) {
      sendError(
        res,
        "Company ID not found. User must be associated with a company.",
        null,
        400
      );
      return;
    }

    // Deactivate ALL existing active schedules for the company
    // A company can only have one active schedule at a time
    const deactivationQuery: any = { isActive: true };

    // Deactivate ALL company schedules regardless of appliesTo
    deactivationQuery.company = companyId;

    await TaxScheduleModel.updateMany(deactivationQuery, { isActive: false });

    // Prepare the schedule data - all schedules are company-specific
    const scheduleData = {
      ...req.body,
      createdBy: (req.user as any)?._id || (req.user as any)?.id,
      company: companyId, // All schedules are company-specific
    };

    // Validate that createdBy is set
    if (!scheduleData.createdBy) {
      sendError(res, "User ID not found in request", null, 400);
      return;
    }

    // Create the new schedule
    const doc = await TaxScheduleModel.create(scheduleData);

    // Populate the created schedule with tax details
    const populatedDoc = await TaxScheduleModel.findById(doc._id)
      .populate(
        "components",
        "name rate type taxType fixedAmount isSuperAdminTax active"
      )
      .populate("createdBy", "firstName lastName email")
      .populate("company", "name");

    sendSuccess(res, "Tax schedule created", { schedule: populatedDoc }, 201);
  } catch (e: any) {
    console.error("Tax schedule creation error:", e);
    sendError(res, "Failed to create schedule", e.message);
  }
}

export async function list(req: Request, res: Response) {
  try {
    const companyId = (req.user as any)?.companyId;

    // All users only see their own company's schedules - full data isolation
    const query = companyId ? { company: companyId } : {};

    const docs = await TaxScheduleModel.find(query)
      .populate(
        "components",
        "name rate type taxType fixedAmount isSuperAdminTax active"
      )
      .populate("createdBy", "firstName lastName email")
      .populate("company", "name")
      .sort({ startDate: -1 });
    sendSuccess(res, "Tax schedules", { schedules: docs });
  } catch (e: any) {
    sendError(res, "Failed to list schedules", e.message);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId;

    // Find the schedule first to check permissions
    const existingSchedule = await TaxScheduleModel.findById(id);
    if (!existingSchedule) {
      sendError(res, "Tax schedule not found", null, 404);
      return;
    }

    // Check if user has permission to update this schedule - full data isolation
    if (!companyId || existingSchedule.company?.toString() !== companyId) {
      sendError(res, "Forbidden", null, 403);
      return;
    }

    // If the schedule is being activated, deactivate all other schedules for the company
    if (req.body.isActive === true) {
      const deactivationQuery: any = {
        isActive: true,
        _id: { $ne: id }, // Exclude the current schedule being updated
      };

      // Deactivate schedules by company
      deactivationQuery.company = companyId;

      await TaxScheduleModel.updateMany(deactivationQuery, { isActive: false });
    }

    const doc = await TaxScheduleModel.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate(
        "components",
        "name rate type taxType fixedAmount isSuperAdminTax active"
      )
      .populate("createdBy", "firstName lastName email")
      .populate("company", "name");
    sendSuccess(res, "Tax schedule updated", { schedule: doc });
  } catch (e: any) {
    sendError(res, "Failed to update schedule", e.message);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId;

    // Find the schedule first to check permissions
    const existingSchedule = await TaxScheduleModel.findById(id);
    if (!existingSchedule) {
      sendError(res, "Tax schedule not found", null, 404);
      return;
    }

    // Check if user has permission to delete this schedule - full data isolation
    if (!companyId || existingSchedule.company?.toString() !== companyId) {
      sendError(res, "Forbidden", null, 403);
      return;
    }

    await TaxScheduleModel.findByIdAndDelete(id);
    sendSuccess(res, "Tax schedule deleted", {});
  } catch (e: any) {
    sendError(res, "Failed to delete schedule", e.message);
  }
}
