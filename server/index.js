import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import { getPublicBranding } from "./controllers/brandingController.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:1234")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(Object.assign(new Error("Origin is not allowed by CORS."), { status: 403 }));
    },
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_request, response) => {
  const databaseReady = mongoose.connection.readyState === 1;
  response.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "unavailable",
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.get("/api/branding", asyncHandler(getPublicBranding));
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/admin", systemRoutes);
app.use(errorHandler);

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  await connectDB();
  app.listen(port, () => {
    console.info(`API listening on port ${port}.`);
  });
} catch (error) {
  console.error("API startup failed:", error);
  process.exitCode = 1;
}
