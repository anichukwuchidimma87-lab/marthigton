import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
} from "../controllers/appointmentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many booking requests. Please try again later." },
});

router.post("/", bookingLimiter, asyncHandler(createAppointment));
router.get(
  "/",
  requireAuth,
  allowRoles("superAdmin", "admin"),
  asyncHandler(listAppointments),
);
router.patch(
  "/:id",
  requireAuth,
  allowRoles("superAdmin", "admin"),
  asyncHandler(updateAppointment),
);

export default router;
