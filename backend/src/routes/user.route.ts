import { Router } from "express";
import { UserController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";

const router = Router();

router.post(
  "/",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  UserController.createUser
);

router.post(
  "/register",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.createUser
);

router.get(
  "/statistics",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  UserController.getUserStatistics
);

// Admin and staff routes
router.get(
  "/",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getAllUsers
);

// Company-specific: Get users for the authenticated user's company
router.get(
  "/company",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getCompanyUsers
);

router.get(
  "/search",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.searchUsers
);

router.get(
  "/identifier/:identifier",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getUserByIdentifier
);

router.get("/:id", AuthMiddleware, UserController.getUserById);

router.put("/:id", AuthMiddleware, UserController.updateUser);

router.put(
  "/:id/role",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  UserController.updateUserRole
);
router.delete("/:id", AuthMiddleware, UserController.deleteUser);

router.post(
  "/loyalty/update",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.updateUserLoyalty
);

export default router;
