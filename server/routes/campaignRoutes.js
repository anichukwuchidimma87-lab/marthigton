import { Router } from "express";
import {
  createCampaign,
  listCampaigns,
  updateCampaign,
} from "../controllers/campaignController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(requireAuth, allowRoles("superAdmin", "admin"));
router.get("/", asyncHandler(listCampaigns));
router.post("/", asyncHandler(createCampaign));
router.patch("/:id", asyncHandler(updateCampaign));

export default router;
