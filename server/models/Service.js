import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    price: { type: Number, min: 0 },
    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
    },
    active: { type: Boolean, default: true, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Service", serviceSchema);
