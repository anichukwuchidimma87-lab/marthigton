import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { normalizeEmail, requireObjectBody } from "../lib/validation.js";

export async function login(request, response) {
  const body = requireObjectBody(request);
  const email = normalizeEmail(body.email);
  if (typeof body.password !== "string" || !body.password || body.password.length > 200) {
    throw Object.assign(new Error("Email and password are required."), { status: 400 });
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches =
    user && (await bcrypt.compare(body.password, user.passwordHash));
  if (!passwordMatches) {
    throw Object.assign(new Error("Email or password is incorrect."), { status: 401 });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
  });
  response.set("Cache-Control", "no-store");
  response.json({
    token,
    expiresIn: 900,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === "agent" ? { referralCode: user.referralCode } : {}),
    },
  });
}

export async function currentUser(request, response) {
  response.json({
    user: {
      id: request.user.id,
      name: request.user.name,
      email: request.user.email,
      role: request.user.role,
      ...(request.user.role === "agent"
        ? { referralCode: request.user.referralCode }
        : {}),
    },
  });
}
