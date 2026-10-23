import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    status: {
      type: String,
      enum: ["lead", "active", "postpartumFollowUp"],
      default: "lead",
      required: true,
    },
    whatsappOptIn: { type: Boolean, default: false, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
