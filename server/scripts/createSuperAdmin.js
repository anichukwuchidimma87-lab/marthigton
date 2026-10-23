import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

if (!SUPER_ADMIN_NAME || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
  throw new Error("Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD.");
}
if (SUPER_ADMIN_PASSWORD.length < 12) {
  throw new Error("SUPER_ADMIN_PASSWORD must contain at least 12 characters.");
}
if (Buffer.byteLength(SUPER_ADMIN_PASSWORD, "utf8") > 72) {
  throw new Error("SUPER_ADMIN_PASSWORD must be no more than 72 UTF-8 bytes.");
}

try {
  await connectDB();
  if (await User.exists({ role: "superAdmin" })) {
    throw new Error("A super admin already exists; refusing to create another.");
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const user = await User.create({
    name: SUPER_ADMIN_NAME.trim(),
    email: SUPER_ADMIN_EMAIL.trim().toLowerCase(),
    passwordHash,
    role: "superAdmin",
  });
  console.info(`Created initial super admin account ${user.email}.`);
} finally {
  await mongoose.disconnect();
}
