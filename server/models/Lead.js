import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    referralCode: { type: String, trim: true, maxlength: 64 },
    tipsOptIn: { type: Boolean, default: false, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "converted"],
      default: "new",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Lead", leadSchema);
