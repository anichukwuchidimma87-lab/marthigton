import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    requestedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "cancelled", "completed"],
      default: "requested",
      required: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ requestedAt: 1, status: 1 });

export default mongoose.model("Appointment", appointmentSchema);
