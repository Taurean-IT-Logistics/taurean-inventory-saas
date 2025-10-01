import { Router } from "express";
import * as TaxScheduleController from "../controllers/taxSchedule.controller";
import {
  AuthMiddleware,
  AuthorizeRoles,
  RequireActiveCompany,
} from "../middlewares";

const router = Router();

const staffAndAbove = [AuthMiddleware, AuthorizeRoles("staff", "admin")];
const allUsers = [
  AuthMiddleware,
  AuthorizeRoles("user", "staff", "admin", "super_admin"),
];

router.get("/", allUsers, RequireActiveCompany(), TaxScheduleController.list);
router.post(
  "/",
  staffAndAbove,
  RequireActiveCompany(),
  TaxScheduleController.create
);
router.put(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  TaxScheduleController.update
);
router.delete(
  "/:id",
  staffAndAbove,
  RequireActiveCompany(),
  TaxScheduleController.remove
);

export default router;
