import { Router } from "express";
import { UserController } from "../controllers";
import { AuthMiddleware, AuthorizeRoles } from "../middlewares";
const router = Router();

// router.post("/", UserController.createUser);
// router.get("/", UserController.getAllUsers);
// router.get("/identifier/:identifier", UserController.getUserByIdentifier);
// router.get("/:id", UserController.getUserById);
// router.put("/:id", UserController.updateUser);
// router.delete("/:id", UserController.deleteUser);

router.post(
  "/",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  UserController.createUser
);

router.get(
  "/",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getAllUsers
);

router.get(
  "/identifier/:identifier",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getUserByIdentifier
);

router.get(
  "/:id",
  AuthMiddleware,
  AuthorizeRoles("admin", "staff"),
  UserController.getUserById
);

router.put("/:id", AuthMiddleware, UserController.updateUser);

router.delete(
  "/:id",
  AuthMiddleware,
  AuthorizeRoles("admin"),
  UserController.deleteUser
);

export default router;
