import { Router } from "express";
import { getMyReferralStats } from "../controllers/agentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.get(
  "/me/stats",
  requireAuth,
  allowRoles("agent"),
  asyncHandler(getMyReferralStats),
);

export default router;
