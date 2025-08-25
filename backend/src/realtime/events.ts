export const Events = {
  BookingCreated: "booking:created",
  BookingUpdated: "booking:updated",
  InventoryCreated: "inventory:created",
  InventoryUpdated: "inventory:updated",
  InventoryDeleted: "inventory:deleted",
  TransactionCreated: "transaction:created",
  TransactionUpdated: "transaction:updated",
  InvoiceCreated: "invoice:created",
  InvoicePaid: "invoice:paid",
  NotificationCreated: "notification:created",
  NotificationUpdated: "notification:updated",
  NotificationDeleted: "notification:deleted",
  EmailSent: "email:sent",
  EmailFailed: "email:failed",
} as const;

export type EventName = typeof Events[keyof typeof Events];