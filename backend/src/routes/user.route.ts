import { Router } from "express";
import { UserController } from "../controllers";
const router = Router();

// router.post("/", UserController.createUser);
// router.get("/", UserController.getAllUsers);
// router.get("/identifier/:identifier", UserController.getUserByIdentifier);
// router.get("/:id", UserController.getUserById);
// router.put("/:id", UserController.updateUser);
// router.delete("/:id", UserController.deleteUser);

router.post("/", async (req, res) => {
  await UserController.createUser(req, res);
});

router.get("/", async (req, res) => {
  await UserController.getAllUsers(req, res);
});

router.get("/identifier/:identifier", async (req, res) => {
  await UserController.getUserByIdentifier(req, res);
});

router.get("/:id", async (req, res) => {
  await UserController.getUserById(req, res);
});

router.put("/:id", async (req, res) => {
  await UserController.updateUser(req, res);
});

router.delete("/:id", async (req, res) => {
  await UserController.deleteUser(req, res);
});

export default router;
