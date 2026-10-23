import { Router } from "express";
import {
  createService,
  listManagedServices,
  listServices,
  updateService,
} from "../controllers/serviceController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.get("/", asyncHandler(listServices));
router.get(
  "/manage",
  requireAuth,
  allowRoles("superAdmin"),
  asyncHandler(listManagedServices),
);
router.post("/", requireAuth, allowRoles("superAdmin"), asyncHandler(createService));
router.patch("/:id", requireAuth, allowRoles("superAdmin"), asyncHandler(updateService));

export default router;
