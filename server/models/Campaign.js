import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    objective: { type: String, required: true, trim: true, maxlength: 2000 },
    messageTemplate: { type: String, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed"],
      default: "draft",
      required: true,
    },
    scheduledAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Campaign", campaignSchema);
