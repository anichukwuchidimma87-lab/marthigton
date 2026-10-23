import { Router } from "express";
import express from "express";
import { getSystemConfiguration } from "../controllers/systemController.js";
import {
  removeBrandLogo,
  updateBrandLogo,
  updateBranding,
} from "../controllers/brandingController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.get(
  "/configuration",
  requireAuth,
  allowRoles("superAdmin"),
  asyncHandler(getSystemConfiguration),
);
router.put(
  "/branding",
  requireAuth,
  allowRoles("superAdmin"),
  asyncHandler(updateBranding),
);
router.put(
  "/branding/logo",
  requireAuth,
  allowRoles("superAdmin"),
  express.raw({
    type: ["image/png", "image/jpeg", "image/webp"],
    limit: "256kb",
  }),
  asyncHandler(updateBrandLogo),
);
router.delete(
  "/branding/logo",
  requireAuth,
  allowRoles("superAdmin"),
  asyncHandler(removeBrandLogo),
);

export default router;
