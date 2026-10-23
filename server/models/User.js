import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "agent", "patient"],
      default: "patient",
      required: true,
    },
    referralCode: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true },
);

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "superAdmin" } },
);

export default mongoose.model("User", userSchema);
