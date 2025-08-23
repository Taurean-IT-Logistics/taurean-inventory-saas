import { NotificationDocument, NotificationModel } from "../models";
import { emitEvent } from "../realtime/socket";

export async function notifyUser(userId: string, payload: {
  type?: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  data?: any;
}): Promise<NotificationDocument> {
  const doc = await NotificationModel.create({
    user: userId,
    type: payload.type || "info",
    title: payload.title,
    message: payload.message,
    data: payload.data,
    isRead: false,
  });
  try {
    emitEvent("notification:user", { id: doc._id, notification: doc }, `user:${userId}`);
  } catch {}
  return doc;
}

export async function notifyCompany(companyId: string, payload: {
  type?: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  data?: any;
}): Promise<NotificationDocument> {
  const doc = await NotificationModel.create({
    company: companyId,
    type: payload.type || "info",
    title: payload.title,
    message: payload.message,
    data: payload.data,
    isRead: false,
  });
  try {
    emitEvent("notification:company", { id: doc._id, notification: doc }, `company:${companyId}`);
  } catch {}
  return doc;
}