import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createLead, listLeads, updateLead } from "../controllers/leadController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
const leadIntakeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." },
});

router.post("/", leadIntakeLimiter, asyncHandler(createLead));
router.get("/", requireAuth, allowRoles("superAdmin", "admin"), asyncHandler(listLeads));
router.patch(
  "/:id",
  requireAuth,
  allowRoles("superAdmin", "admin"),
  asyncHandler(updateLead),
);

export default router;
