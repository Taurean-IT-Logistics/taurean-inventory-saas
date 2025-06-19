import { Router } from "express";
import { ResourceController } from "../controllers";

const router: Router = Router();

// Public: Get resource by file path
router.get(/(.*)/, ResourceController.getResource);

export default router;
