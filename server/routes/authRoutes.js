import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { currentUser, login } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(currentUser));

export default router;
