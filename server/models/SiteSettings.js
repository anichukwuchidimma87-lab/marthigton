import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "site-branding" },
    brandName: { type: String, default: "Marthington", trim: true, maxlength: 80 },
    tagline: {
      type: String,
      default: "Family & maternal care",
      trim: true,
      maxlength: 120,
    },
    logo: {
      mimeType: { type: String, enum: ["image/png", "image/jpeg", "image/webp"] },
      data: { type: Buffer },
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
