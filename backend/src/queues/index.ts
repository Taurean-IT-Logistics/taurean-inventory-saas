import { Queue, Worker, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { CONFIG } from "../config";
import { DeletionRequestModel } from "../models/deletionRequest.model";
import mongoose from "mongoose";

const connection = new IORedis(CONFIG.REDIS_URL as string);

export const deletionQueue = new Queue("deletion-queue", { connection });

export async function enqueueDeletion(requestId: string, executeAt: Date) {
  const delay = Math.max(0, executeAt.getTime() - Date.now());
  const opts: JobsOptions = { delay, removeOnComplete: true, removeOnFail: false };
  await deletionQueue.add("execute-delete", { requestId }, opts);
}

export function startDeletionWorker() {
  const worker = new Worker(
    "deletion-queue",
    async (job) => {
      const { requestId } = job.data as { requestId: string };
      const req = await DeletionRequestModel.findById(requestId);
      if (!req || (req as any).status !== "queued") return;
      if ((req as any).executeAfter > new Date()) return; // safety guard
      // Perform scoped deletions
      if ((req as any).scope === "company" && (req as any).company) {
        const companyId = (req as any).company as mongoose.Types.ObjectId;
        // delete company-related data: users, facilities, inventory, bookings, transactions, etc.
        // Soft delete or hard delete as per requirement; here hard delete
        await Promise.all([
          mongoose.connection.collection("users").deleteMany({ company: companyId }),
          mongoose.connection.collection("facilities").deleteMany({ createdByCompany: companyId }),
          mongoose.connection.collection("inventoryitems").deleteMany({ company: companyId }),
          mongoose.connection.collection("bookings").deleteMany({ company: companyId }),
          mongoose.connection.collection("transactions").deleteMany({ company: companyId }),
          mongoose.connection.collection("invoices").deleteMany({ company: companyId }),
          mongoose.connection.collection("receipts").deleteMany({ company: companyId }),
        ]);
        await mongoose.connection.collection("companies").deleteOne({ _id: companyId });
      } else if ((req as any).scope === "user" && (req as any).user) {
        const userId = (req as any).user as mongoose.Types.ObjectId;
        await Promise.all([
          mongoose.connection.collection("bookings").deleteMany({ user: userId }),
          mongoose.connection.collection("transactions").deleteMany({ user: userId }),
        ]);
        await mongoose.connection.collection("users").deleteOne({ _id: userId });
      }
      (req as any).status = "executed";
      (req as any).executedAt = new Date();
      await req.save();
    },
    { connection }
  );
  worker.on("failed", (job, err) => {
    console.error("Deletion job failed", job?.id, err);
  });
}