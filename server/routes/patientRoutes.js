import { Router } from "express";
import {
  createPatient,
  listPatients,
  updatePatient,
} from "../controllers/patientController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(requireAuth, allowRoles("superAdmin", "admin"));
router.get("/", asyncHandler(listPatients));
router.post("/", asyncHandler(createPatient));
router.patch("/:id", asyncHandler(updatePatient));

export default router;
