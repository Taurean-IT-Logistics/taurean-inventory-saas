export enum Events {
  // User Events
  UserCreated = "user:created",
  UserUpdated = "user:updated",
  UserDeleted = "user:deleted",
  UserLoggedIn = "user:logged_in",
  UserLoggedOut = "user:logged_out",

  // Company Events
  CompanyCreated = "company:created",
  CompanyUpdated = "company:updated",
  CompanyDeleted = "company:deleted",

  // Inventory Events
  InventoryItemCreated = "inventory:item:created",
  InventoryItemUpdated = "inventory:item:updated",
  InventoryItemDeleted = "inventory:item:deleted",
  InventoryUpdated = "inventory:updated",

  // Rental Events
  RentalCreated = "rental:created",
  RentalUpdated = "rental:updated",
  RentalReturned = "rental:returned",
  RentalOverdue = "rental:overdue",
  RentalConfirmed = "rental:confirmed",

  // Booking Events
  BookingCreated = "booking:created",
  BookingUpdated = "booking:updated",
  BookingCancelled = "booking:cancelled",
  BookingConfirmed = "booking:confirmed",

  // Transaction Events
  TransactionCreated = "transaction:created",
  TransactionUpdated = "transaction:updated",
  PaymentProcessed = "payment:processed",
  PaymentFailed = "payment:failed",

  // Payment Schedule Events
  PaymentScheduleCreated = "payment_schedule:created",
  PaymentScheduleUpdated = "payment_schedule:updated",
  PaymentScheduleCancelled = "payment_schedule:cancelled",

  // Notification Events
  NotificationCreated = "notification:created",
  NotificationRead = "notification:read",
  NotificationDeleted = "notification:deleted",

  // Maintenance Events
  MaintenanceScheduled = "maintenance:scheduled",
  MaintenanceCompleted = "maintenance:completed",
  MaintenanceOverdue = "maintenance:overdue",

  // System Events
  SystemMaintenance = "system:maintenance",
  SystemUpdate = "system:update",
  SystemAlert = "system:alert",
}
