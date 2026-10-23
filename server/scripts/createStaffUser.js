import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

const { STAFF_NAME, STAFF_EMAIL, STAFF_PASSWORD, STAFF_ROLE } = process.env;
if (!STAFF_NAME || !STAFF_EMAIL || !STAFF_PASSWORD || !["admin", "agent"].includes(STAFF_ROLE)) {
  throw new Error("Set STAFF_NAME, STAFF_EMAIL, STAFF_PASSWORD, and STAFF_ROLE (admin or agent).");
}
if (STAFF_PASSWORD.length < 12 || Buffer.byteLength(STAFF_PASSWORD, "utf8") > 72) {
  throw new Error("STAFF_PASSWORD must be 12-72 UTF-8 bytes.");
}

try {
  await connectDB();
  const passwordHash = await bcrypt.hash(STAFF_PASSWORD, 12);
  const user = await User.create({
    name: STAFF_NAME.trim(),
    email: STAFF_EMAIL.trim().toLowerCase(),
    passwordHash,
    role: STAFF_ROLE,
    ...(STAFF_ROLE === "agent"
      ? { referralCode: `agent-${randomBytes(6).toString("hex")}` }
      : {}),
  });
  console.info(
    user.role === "agent"
      ? `Created agent account ${user.email} with referral code ${user.referralCode}.`
      : `Created ${user.role} account ${user.email}.`,
  );
} finally {
  await mongoose.disconnect();
}
