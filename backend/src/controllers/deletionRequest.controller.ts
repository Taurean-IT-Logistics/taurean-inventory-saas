import { Request, Response } from "express";
import { DeletionRequestModel } from "../models/deletionRequest.model";
import { sendSuccess, sendError } from "../utils";
import { CONFIG } from "../config";
import { enqueueDeletion } from "../queues";
import { UserModel, CompanyModel, BookingModel, InventoryItemModel, TransactionModel, NotificationModel } from "../models";

export async function queueDeletion(req: Request, res: Response) {
  try {
    const { scope, companyId, userId, reason } = req.body;
    const executeAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const doc = await DeletionRequestModel.create({
      scope,
      company: companyId,
      user: userId,
      requestedBy: (req.user as any).id,
      executeAfter,
      reason,
    } as any);
    return sendSuccess(res, "Deletion queued", { request: doc }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to queue deletion", e.message);
  }
}

export async function list(req: Request, res: Response) {
  try {
    const docs = await DeletionRequestModel.find().sort({ executeAfter: 1 });
    return sendSuccess(res, "Deletion requests", { requests: docs });
  } catch (e: any) {
    return sendError(res, "Failed to list deletion requests", e.message);
  }
}

export async function processDueDeletions() {
  const now = new Date();
  const due = await DeletionRequestModel.find({ status: "queued", executeAfter: { $lte: now } });
  for (const req of due) {
    try {
      if ((req as any).scope === "user" && (req as any).user) {
        const uid = (req as any).user.toString();
        await BookingModel.deleteMany({ user: uid } as any);
        await TransactionModel.deleteMany({ user: uid } as any);
        await NotificationModel.deleteMany({ user: uid } as any);
        await UserModel.deleteOne({ _id: uid } as any);
      } else if ((req as any).scope === "company" && (req as any).company) {
        const cid = (req as any).company.toString();
        await BookingModel.deleteMany({} as any);
        await InventoryItemModel.deleteMany({} as any);
        await TransactionModel.deleteMany({} as any);
        await NotificationModel.deleteMany({} as any);
        await UserModel.deleteMany({ company: cid } as any);
        await CompanyModel.deleteOne({ _id: cid } as any);
      }
      (req as any).status = "executed";
      (req as any).executedAt = new Date();
      await req.save();
    } catch (e) {
      // keep queued to retry or add failure state if needed
    }
  }
}

export async function queueCompanyDeletion(req: Request, res: Response) {
  try {
    if (!(req.user as any)?.isSuperAdmin) return sendError(res, "Forbidden", null, 403);
    const { companyId, reason } = req.body;
    const executeAfter = new Date(Date.now() + CONFIG.HARD_DELETE_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const doc = await DeletionRequestModel.create({
      scope: "company",
      company: companyId,
      requestedBy: (req.user as any).id,
      executeAfter,
      status: "queued",
      reason,
    } as any);
    await enqueueDeletion((doc as any)._id.toString(), executeAfter);
    return sendSuccess(res, "Company deletion queued", { request: doc }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to queue deletion", e.message);
  }
}

export async function queueUserDeletion(req: Request, res: Response) {
  try {
    const { userId, reason } = req.body;
    const executeAfter = new Date(Date.now() + CONFIG.HARD_DELETE_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const doc = await DeletionRequestModel.create({
      scope: "user",
      user: userId,
      requestedBy: (req.user as any).id,
      executeAfter,
      status: "queued",
      reason,
    } as any);
    await enqueueDeletion((doc as any)._id.toString(), executeAfter);
    return sendSuccess(res, "User deletion queued", { request: doc }, 201);
  } catch (e: any) {
    return sendError(res, "Failed to queue deletion", e.message);
  }
}

export async function cancelDeletion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await DeletionRequestModel.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
    if (!doc) return sendError(res, "Request not found", null, 404);
    return sendSuccess(res, "Deletion cancelled", { request: doc });
  } catch (e: any) {
    return sendError(res, "Failed to cancel deletion", e.message);
  }
}