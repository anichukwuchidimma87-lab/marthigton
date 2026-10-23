import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(request, _response, next) {
  try {
    const authorization = request.get("authorization") || "";
    const [scheme, token, ...extra] = authorization.split(" ");
    if (scheme !== "Bearer" || !token || extra.length) {
      return next(Object.assign(new Error("Authentication is required."), { status: 401 }));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!payload.sub) {
      return next(Object.assign(new Error("Invalid authentication token."), { status: 401 }));
    }

    const user = await User.findById(payload.sub).select("name email role referralCode");
    if (!user) {
      return next(Object.assign(new Error("Account is no longer available."), { status: 401 }));
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(Object.assign(new Error("Authentication token is invalid or expired."), { status: 401 }));
    }
    next(error);
  }
}
